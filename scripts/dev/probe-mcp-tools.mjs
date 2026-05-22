#!/usr/bin/env node
// probe-mcp-tools.mjs
//
// Driver simplu JSON-RPC pe stdio: spawneaza serverul medusa-mcp, face initialize +
// tools/list, printeaza numele tool-urilor la stdout, exit.
//
// Usage:
//   node scripts/dev/probe-mcp-tools.mjs > tools/.medusa-mcp-tools.txt
//
// Foloseste .env din tools/medusa-mcp/.env (acelasi pe care Claude Code il va folosi).

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const mcpDir = path.join(repoRoot, "tools/medusa-mcp");
const mcpEntry = path.join(mcpDir, "dist/index.js");
const envFile = path.join(mcpDir, ".env");

if (!fs.existsSync(mcpEntry)) {
  console.error(`[probe] missing ${mcpEntry}. Run: cd tools/medusa-mcp && npm install && npm run build`);
  process.exit(1);
}

// Mini dotenv parser (evitam dep externa la root)
const envVars = {};
if (fs.existsSync(envFile)) {
  const raw = fs.readFileSync(envFile, "utf-8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m) envVars[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const proc = spawn("node", [mcpEntry], {
  stdio: ["pipe", "pipe", "inherit"],
  cwd: mcpDir,
  env: { ...process.env, ...envVars },
});

let buffer = "";
let nextId = 1;
const pending = new Map();

const sendRequest = (method, params = {}) => {
  const id = nextId++;
  const msg = JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n";
  proc.stdin.write(msg);
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
};

proc.stdout.on("data", (chunk) => {
  buffer += chunk.toString();
  let idx;
  while ((idx = buffer.indexOf("\n")) >= 0) {
    const line = buffer.slice(0, idx).trim();
    buffer = buffer.slice(idx + 1);
    if (!line) continue;
    try {
      const msg = JSON.parse(line);
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
    } catch {
      // not a JSON-RPC line (could be server log to stdout); ignore
    }
  }
});

(async () => {
  try {
    // Initialize
    await sendRequest("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "ardmag-probe", version: "0.0.1" },
    });
    // List tools
    const res = await sendRequest("tools/list", {});
    const tools = (res?.tools || []).sort((a, b) => a.name.localeCompare(b.name));
    console.log(`# medusa-mcp tools probe`);
    console.log(`# generated ${new Date().toISOString()}`);
    console.log(`# total: ${tools.length}`);
    console.log("");
    for (const t of tools) {
      const desc = (t.description || "").split("\n")[0].slice(0, 100);
      console.log(`${t.name}\t${desc}`);
    }
    proc.kill();
    setTimeout(() => process.exit(0), 200);
  } catch (e) {
    console.error("[probe] error:", e.message);
    proc.kill();
    process.exit(1);
  }
})();

// Safety timeout
setTimeout(() => {
  console.error("[probe] timeout after 30s");
  proc.kill();
  process.exit(1);
}, 30000);
