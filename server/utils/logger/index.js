const winston = require("winston");

class Logger {
  logger = console;
  static _instance;
  constructor() {
    if (Logger._instance) return Logger._instance;
    const debugEnabled = process.env.DEBUG === "true";
    if (process.env.NODE_ENV === "production") {
      this.logger = this.getWinstonLogger(debugEnabled);
    } else {
      const originalLog = console.log.bind(console);
      const originalDebug = console.debug.bind(console);

      console.log = function (...args) {
        if (debugEnabled) originalLog(...args);
      };
      console.debug = function (...args) {
        if (debugEnabled) originalDebug(...args);
      };
      this.logger = console;
    }
    Logger._instance = this;
  }

  getWinstonLogger(debugEnabled) {
    const logger = winston.createLogger({
      level: debugEnabled ? "debug" : "info",
      defaultMeta: { service: "backend" },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(
              ({ level, message, service, origin = "" }) => {
                return `\x1b[36m[${service}]\x1b[0m${origin ? `\x1b[33m[${origin}]\x1b[0m` : ""} ${level}: ${message}`;
              }
            )
          ),
        }),
      ],
    });

    function formatArgs(args) {
      return args
        .map((arg) => {
          if (arg instanceof Error) {
            return arg.stack; // If argument is an Error object, return its stack trace
          } else if (typeof arg === "object") {
            return JSON.stringify(arg); // Convert objects to JSON string
          } else {
            return arg; // Otherwise, return as-is
          }
        })
        .join(" ");
    }

    console.log = function (...args) {
      logger.debug(formatArgs(args));
    };
    console.debug = function (...args) {
      logger.debug(formatArgs(args));
    };
    console.error = function (...args) {
      logger.error(formatArgs(args));
    };
    console.info = function (...args) {
      logger.info(formatArgs(args));
    };
    console.warn = function (...args) {
      logger.warn(formatArgs(args));
    };
    return logger;
  }
}

/**
 * Sets and overrides Console methods for logging when called.
 * This is a singleton method and will not create multiple loggers.
 * @returns {winston.Logger | console} - instantiated logger interface.
 */
function setLogger() {
  return new Logger().logger;
}
module.exports = setLogger;
