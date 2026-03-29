import { Request, Response, NextFunction } from "express";

//////////////////////////////
// GLOBAL ERROR HANDLER
//////////////////////////////

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("🔥 ERROR:", err);

  // Zod validation error
  if (err.name === "ZodError") {
    return res.status(400).json({
      message: "Validation failed",
      errors: err.errors,
    });
  }

  // Prisma errors (optional handling)
  if (err.code === "P2002") {
    return res.status(409).json({
      message: "Duplicate field value",
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      message: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      message: "Token expired",
    });
  }

  // Default fallback
  return res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
};