import type { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function errorHandler(err: AppError, _req: Request, res: Response, _next: NextFunction) {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : "Internal Server Error";

  console.error(`[ERROR] ${statusCode} - ${err.message}`);
  if (statusCode === 500) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
}

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  const error: AppError = new Error("Route not found");
  error.statusCode = 404;
  error.isOperational = true;
  next(error);
}
