import type { NextFunction, Request, Response } from "express";
import type { RequestBody, ValidationErrorResponse } from "../types/types";

export const validateBodyParams = (requiredParams: string[]) => {
  return (
    req: Request<{}, any, RequestBody>,
    res: Response<ValidationErrorResponse>,
    next: NextFunction
  ): void => {
    // Check if body exists
    if (!req.body) {
      res.status(400).json({
        error: "Request body is missing",
        missingParams: requiredParams,
      });
      return; // Explicitly stop further execution
    }

    // Check for missing parameters
    const missingParams = requiredParams.filter(
      (param) =>
        req.body[param] === undefined ||
        req.body[param] === null ||
        req.body[param] === ""
    );

    // If any required parameters are missing, return error
    if (missingParams.length > 0) {
      res.status(400).json({
        error: "Missing required body parameters",
        missingParams: missingParams,
      });
      return; // Explicitly stop further execution
    }

    // All required parameters are present, proceed to next middleware
    next();
  };
};
