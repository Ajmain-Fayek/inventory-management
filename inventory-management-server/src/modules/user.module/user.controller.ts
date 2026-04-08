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

const getProfile = catchAsync(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new AppError("Unauthorized", status.UNAUTHORIZED);
  }

  const result = await UserService.getProfileData(req.user.id);
  sendResponse(res, {
    httpStatusCode: status.OK,
    message: "Profile retrieved successfully",
    success: true,
    data: result,
  });
});

const getAdminDashboard = catchAsync(async (req: Request, res: Response) => {
  if (req.user?.role !== "ADMIN") {
    throw new AppError("Only admins can access this resource", status.FORBIDDEN);
  }

  const result = await UserService.getAdminDashboardData();
  sendResponse(res, {
    httpStatusCode: status.OK,
    message: "Admin dashboard data retrieved successfully",
    success: true,
    data: result,
  });
});

const adminActionUsers = catchAsync(async (req: Request, res: Response) => {
  if (req.user?.role !== "ADMIN") {
    throw new AppError("Only admins can access this resource", status.FORBIDDEN);
  }

  const { userIds, action } = req.body as {
    userIds?: string[];
    action?: "BLOCK" | "UNBLOCK" | "MAKE_ADMIN" | "REMOVE_ADMIN" | "DELETE";
  };

  if (!Array.isArray(userIds) || userIds.length === 0 || !action) {
    throw new AppError("userIds and action are required", status.BAD_REQUEST);
  }

  const result = await UserService.updateUsersByAdmin(userIds, action);
  sendResponse(res, {
    httpStatusCode: status.OK,
    message: "User updates applied successfully",
    success: true,
    data: result,
  });
});

export const UserController = {
  getUser,
  getProfile,
  getAdminDashboard,
  adminActionUsers,
};
