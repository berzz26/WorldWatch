import "dotenv/config";
import { start } from "./scheduler/runner";
import logger from "./logger";

logger.info("Starting WorldWatch");
start();