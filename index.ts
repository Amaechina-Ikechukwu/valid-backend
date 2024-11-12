import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import admin from "firebase-admin";
import usersRouter from "./src/controllers/users";
import contributionRouter from "./src/controllers/contributionroutes";
import morganMiddleware from "./configs/morgan";
import { transactionsRouter } from "./src/controllers/transactionsRouter";
import cors from "cors";
import helmet from "helmet"; // Security headers
import rateLimit from "express-rate-limit"; // Rate limiting
import logger from "./configs/logger";
import aiRouter from "./src/controllers/aiRouter";

const app = express();
const port = process.env.PORT || 3008;

// Security: Environment-based CORS configuration
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [process.env.ALLOWED]
    : ["http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: process.env.DATABASE_URL,
});

// Security: Rate limiting to mitigate brute-force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later.",
});
app.use(limiter);

// Security: Set secure HTTP headers
app.use(helmet());

// Morgan middleware for logging (ensure no sensitive info is logged)
app.use(morganMiddleware);

// JSON parser
app.use(express.json());

// Input validation middleware (for demonstration, add actual validation logic)
// const validateRequest = (req, res, next) => {
//   // Implement validation logic here, e.g., checking for required fields
//   // For example, if validating a user ID from req.params.id:
//   // if (!req.params.id.match(/^[a-fA-F0-9]{24}$/)) {
//   //   return res.status(400).json({ error: "Invalid ID format" });
//   // }
//   next();
// };

// Routes
app.use("/user", usersRouter);
app.use("/contributions", contributionRouter);
app.use("/transactions", transactionsRouter);
app.use("/ai", aiRouter);

// Centralized error handling
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err);
  console.error(err.message); // Log error details (avoid logging sensitive data)
  res.status(err.status || 500).json({ error: "Internal Server Error" });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});
