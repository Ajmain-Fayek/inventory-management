import { NextFunction, Request, Response } from "express";
import z from "zod";
import { AppError } from "@/errorHelper/AppError.js";
import status from "http-status";

export const validateRequest = (zodSchema: z.ZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }

    const parsedResult = zodSchema.safeParse(req.body);

    if (!parsedResult.success) {
      const message = parsedResult.error.issues.map((issue) => issue.message).join(", ");
      return next(new AppError(message || "Invalid request payload", status.BAD_REQUEST));
    }

    //sanitizing the data
    req.body = parsedResult.data;

    next();
  };
};
