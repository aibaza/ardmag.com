import * as fs from "fs"
import * as path from "path"
import type { StateEntry, ProductState } from "./types"

const STATE_FILE = path.resolve(__dirname, "../.enrichment-state.jsonl")

// Load all state entries and fold to latest per handle
export function loadState(): Map<string, StateEntry> {
  const map = new Map<string, StateEntry>()
  if (!fs.existsSync(STATE_FILE)) return map
  const lines = fs.readFileSync(STATE_FILE, "utf8").split("\n").filter(Boolean)
  for (const line of lines) {
    try {
      const entry: StateEntry = JSON.parse(line)
      map.set(entry.handle, entry) // later entries overwrite earlier = fold to latest
    } catch {
      // ignore malformed lines
    }
  }
  return map
}

// Append a state transition entry
export function saveState(entry: StateEntry): void {
  fs.appendFileSync(STATE_FILE, JSON.stringify(entry) + "\n", "utf8")
}

// Check if a handle should be skipped (already done or skipped)
export function isAlreadyDone(state: Map<string, StateEntry>, handle: string): boolean {
  const entry = state.get(handle)
  if (!entry) return false
  return entry.state === "VERIFIED" || entry.state === "SKIPPED"
}

// Reset state for specific handles (removes their entries and rewrites file)
export function resetHandles(handles: string[]): void {
  if (!fs.existsSync(STATE_FILE)) return
  const lines = fs.readFileSync(STATE_FILE, "utf8").split("\n").filter(Boolean)
  const kept = lines.filter(line => {
    try {
      const e: StateEntry = JSON.parse(line)
      return !handles.includes(e.handle)
    } catch {
      return true
    }
  })
  fs.writeFileSync(STATE_FILE, kept.join("\n") + (kept.length ? "\n" : ""), "utf8")
}

// Transition helper: save a state entry with current timestamp
export function transition(
  handle: string,
  state: ProductState,
  extra?: Partial<StateEntry>
): void {
  saveState({ handle, state, ts: new Date().toISOString(), ...extra })
}
