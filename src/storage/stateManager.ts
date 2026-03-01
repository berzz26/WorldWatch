import { readFileSync, writeFileSync } from "fs";

const FILE = "./src/storage/state.json";

export function loadState() {
  try {
    return JSON.parse(readFileSync(FILE, "utf-8"));
  } catch {
    return { seen: [] };
  }
}

export function saveState(state: any) {
  writeFileSync(FILE, JSON.stringify(state, null, 2));
}