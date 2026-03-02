import { AppError } from "@/errorHelper/AppError.js";
import { catchAsync } from "@/shared/catchAsync.js";
import { sendResponse } from "@/shared/sendResponse.js";
import { Request, Response } from "express";
import status from "http-status";
import { TagService } from "./tag.service.js";

const getTag = catchAsync(async (req: Request, res: Response) => {
  const { tag } = req.query;

  if (tag === undefined) {
    throw new AppError("Tag query not found", status.BAD_REQUEST);
  }

  const result = await TagService.getTag(tag as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    message: "Tag retrived successfully",
    success: true,
    data: result,
  });
});

const createTag = catchAsync(async (req: Request, res: Response) => {
  const { tag }: { tag: string } = req.body;

  if (tag === undefined) {
    throw new AppError("Tag paylod not found", status.BAD_REQUEST);
  }

  const tagLower = tag.toLowerCase();
  console.log(tagLower);

  const result = await TagService.createTag(tagLower);

  sendResponse(res, {
    httpStatusCode: status.OK,
    message: "Tag created succesfully",
    success: true,
    data: result,
  });
});

export const TagController = {
  getTag,
  createTag,
};
