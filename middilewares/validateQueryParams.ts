import type { NextFunction, Request, Response } from "express";

const validateQueryParams = (requiredParams: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missingParams = requiredParams.filter((param) => !req.query[param]);

    if (missingParams.length > 0) {
      res.status(400).json({
        error: "Missing required query parameters",
        missingParams,
      });
      return;
    }

    // Validate query param format
    for (const key of requiredParams) {
      if (typeof req.query[key] !== "string" || req.query[key]?.trim() === "") {
        res.status(400).json({
          error: `Invalid query parameter: ${key}`,
        });
        return;
      }
    }

    next();
  };
};

export default validateQueryParams;
