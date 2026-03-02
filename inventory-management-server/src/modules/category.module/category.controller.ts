import { catchAsync } from "@/shared/catchAsync.js";
import { Request, Response } from "express";
import { CategoryService } from "./category.service.js";
import { sendResponse } from "@/shared/sendResponse.js";
import status from "http-status";

const getCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await CategoryService.getCategories();

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Category retrived successfully",
    data: category,
  });
});

export const CategoryController = {
  getCategory,
};
