#!/usr/bin/env node
// tools/mcp-proxy.mjs
//
// MCP stdio proxy care intercepteaza tools/list response si sanitizeaza
// property keys invalide (Anthropic API cere ^[a-zA-Z0-9_.-]{1,64}$).
//
// Background: medusa-mcp upstream genereaza scheme cu chei MongoDB-style
// ($and, $or, $eq, etc.) care fac Anthropic API sa returneze 400 si Claude
// Code sa refuze sa incarce tool-ul. Drop-uim recursiv aceste chei.
//
// Proxy-ul forwardeaza tot restul traficului (initialize, tools/call, etc.)
// neschimbat.

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync, existsSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MCP_DIR = join(__dirname, "medusa-mcp");
const MCP_ENTRY = join(MCP_DIR, "dist/index.js");

// Validator pentru property keys conform Anthropic (^[a-zA-Z0-9_.-]{1,64}$)
const VALID_KEY = /^[a-zA-Z0-9_.\-]{1,64}$/;

// Sanitize recursiv: elimina chei invalide din inputSchema.properties si nested obiecte.
// Elimina si din 'required' array daca contine chei invalide.
function sanitizeSchema(node) {
  if (!node || typeof node !== "object") return node;
  if (Array.isArray(node)) {
    return node.map(sanitizeSchema).filter((v) => v !== undefined);
  }

  const out = {};
  for (const [k, v] of Object.entries(node)) {
    if (k === "properties" && v && typeof v === "object" && !Array.isArray(v)) {
      const cleanProps = {};
      for (const [pk, pv] of Object.entries(v)) {
        if (VALID_KEY.test(pk)) {
          cleanProps[pk] = sanitizeSchema(pv);
        }
        // else: drop silently
      }
      out[k] = cleanProps;
    } else if (k === "required" && Array.isArray(v)) {
      out[k] = v.filter((r) => typeof r === "string" && VALID_KEY.test(r));
    } else {
      out[k] = sanitizeSchema(v);
    }
  }
  return out;
}

// Load env din tools/medusa-mcp/.env (manual parse, fara dotenv dep)
const envFile = join(MCP_DIR, ".env");
const envVars = {};
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf-8").split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m) envVars[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

// Spawneaza MCP-ul real
const child = spawn("node", [MCP_ENTRY], {
  stdio: ["pipe", "pipe", "inherit"],
  cwd: MCP_DIR,
  env: { ...process.env, ...envVars },
});

// Buffer pentru a parsa line-by-line JSON-RPC din MCP child
let childBuf = "";
child.stdout.on("data", (chunk) => {
  childBuf += chunk.toString();
  let idx;
  while ((idx = childBuf.indexOf("\n")) >= 0) {
    const line = childBuf.slice(0, idx);
    childBuf = childBuf.slice(idx + 1);
    if (!line.trim()) continue;

    try {
      const msg = JSON.parse(line);
      // Daca e response la tools/list, sanitize fiecare tool's inputSchema
      if (msg.result && Array.isArray(msg.result.tools)) {
        msg.result.tools = msg.result.tools.map((tool) => ({
          ...tool,
          inputSchema: tool.inputSchema ? sanitizeSchema(tool.inputSchema) : tool.inputSchema,
        }));
      }
      process.stdout.write(JSON.stringify(msg) + "\n");
    } catch {
      // not JSON or partial - forward raw
      process.stdout.write(line + "\n");
    }
  }
});

// Forward stdin (client -> child) neschimbat
process.stdin.on("data", (chunk) => {
  child.stdin.write(chunk);
});

process.stdin.on("end", () => {
  child.stdin.end();
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});

process.on("SIGTERM", () => child.kill("SIGTERM"));
process.on("SIGINT", () => child.kill("SIGINT"));
