import { readFileSync, writeFileSync } from "fs";
import { getLogger } from "../logger";

const log = getLogger("state");
const FILE = "./src/storage/state.json";

export function loadState() {
  try {
    const raw = readFileSync(FILE, "utf-8");
    const state = JSON.parse(raw);
    log.debug({ seenCount: state.seen?.length ?? 0 }, "State loaded");
    return state;
  } catch {
    log.debug("No state file, using default");
    return { seen: [] };
  }
}

export function saveState(state: any) {
  writeFileSync(FILE, JSON.stringify(state, null, 2));
  log.debug({ seenCount: state.seen?.length }, "State saved");
}