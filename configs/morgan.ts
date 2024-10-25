import morgan from "morgan";
import logger from "./logger";

// Create a custom Morgan token to log HTTP requests using Winston
const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

// Morgan middleware configuration: log HTTP requests in 'combined' format
const morganMiddleware = morgan("combined", { stream });

export default morganMiddleware;
