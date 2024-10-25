import { createLogger, format, transports } from "winston";

// Create a Winston logger instance
const logger = createLogger({
  level: "info", // Set log level
  format: format.combine(
    format.timestamp(), // Add timestamps to log entries
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`; // Format log output
    })
  ),
  transports: [
    new transports.Console(), // Log to console
    new transports.File({ filename: "logs/error.log", level: "error" }), // Log errors to file
    new transports.File({ filename: "logs/combined.log" }), // Log all activity to combined log
  ],
});

export default logger;
