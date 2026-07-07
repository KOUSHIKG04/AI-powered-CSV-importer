import type { NextFunction, Request, Response } from "express";

export function errorHandler( err: any, req: Request, res: Response, next: NextFunction,
) {
  console.error("Global Error Caught:", err);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(err.statusCode || 500).json({
    success: false,
    data: null,
    error: err.message || "INTERNAL_SERVER_ERROR",
  });
}
