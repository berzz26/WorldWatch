import pino from "pino";

const isPretty =
  process.env.LOG_PRETTY === "1" || process.env.NODE_ENV !== "production";
const level = (process.env.LOG_LEVEL ?? "info").toLowerCase();

const baseOptions: pino.LoggerOptions = {
  level,
  base: null,
  timestamp: pino.stdTimeFunctions.isoTime,
};

const logger = isPretty
  ? pino({
      ...baseOptions,
      transport: {
        target: "pino-pretty",
        options: { colorize: true, translateTime: "SYS:HH:MM:ss" },
      },
    })
  : pino(baseOptions);

export type Logger = pino.Logger;

export function getLogger(module: string): Logger {
  return logger.child({ module });
}

export default logger;
