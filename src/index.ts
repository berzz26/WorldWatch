import "dotenv/config";
import { run } from "./scheduler/runner";
import logger from "./logger";

logger.info("Starting WorldWatch");
run();