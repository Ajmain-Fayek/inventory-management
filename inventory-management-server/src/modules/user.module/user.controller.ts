import { catchAsync } from "@/shared/catchAsync.js";
import { sendResponse } from "@/shared/sendResponse.js";
import { Request, Response } from "express";
import status from "http-status";
import { UserService } from "./user.service.js";
import { AppError } from "@/errorHelper/AppError.js";
const getUser = catchAsync(async (req: Request, res: Response) => {
  const { user } = req.query;

  console.log(user);

  if (user === undefined) {
    throw new AppError("Query not found", status.BAD_REQUEST);
  }

  const result = await UserService.getUser(user as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    message: "User retrived successfully",
    success: true,
    data: result,
  });
});

export const UserController = {
  getUser,
};
