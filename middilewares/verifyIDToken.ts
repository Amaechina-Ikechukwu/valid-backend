import type { NextFunction, Request, Response } from "express";
import { getAuth } from "firebase-admin/auth";
import type { CustomRequest } from "../types";

const verifyIDToken = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized, no token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify token using Firebase Admin SDK
    const decodedToken = await getAuth().verifyIdToken(token);
    req.user = decodedToken.uid; // Attach the decoded user to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    return res.status(403).json({ message: "Forbidden, token is invalid" });
  }
};

export default verifyIDToken;
