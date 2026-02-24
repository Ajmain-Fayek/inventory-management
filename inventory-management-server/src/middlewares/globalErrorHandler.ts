import envConfig from "@/config/env.js";
import { AppError } from "@/errorHelper/AppError.js";
import { TErrorResponse, TErrorSources } from "@/interfaces/error.interface.js";
import { logger } from "better-auth";
import { Request, Response, NextFunction } from "express";
import status from "http-status";

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (envConfig.NODE_ENV === "development") {
    logger.error(
      `unexpected error: ${err instanceof Error ? err.stack || err.message : "unknown error"}`,
    );
  }

  let errorSources: TErrorSources[] = [];
  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message = "Internal Server Error";
  let stack: string | undefined = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    stack = err.stack;
    errorSources = [
      {
        path: req.originalUrl,
        message: err.message,
      },
    ];
  } else if (err instanceof Error) {
    statusCode = status.INTERNAL_SERVER_ERROR;
    message = err.message;
    stack = err.stack;
    errorSources = [
      {
        path: req.originalUrl,
        message: err.message,
      },
    ];
  }

  const errorResponse: TErrorResponse = {
    success: false,
    message: message,
    errorSources,
    error: envConfig.NODE_ENV === "development" ? err : undefined,
    stack: envConfig.NODE_ENV === "development" ? stack : undefined,
  };

  res.status(statusCode).json(errorResponse);
};
