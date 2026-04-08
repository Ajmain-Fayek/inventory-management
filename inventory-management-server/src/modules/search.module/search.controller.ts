import { catchAsync } from "@/shared/catchAsync.js";
import { sendResponse } from "@/shared/sendResponse.js";
import { Request, Response } from "express";
import status from "http-status";
import { AppError } from "@/errorHelper/AppError.js";
import { SearchService } from "./search.service.js";

const search = catchAsync(async (req: Request, res: Response) => {
  const q = req.query.q;
  if (typeof q !== "string") {
    throw new AppError("Missing query parameter: q", status.BAD_REQUEST);
  }

  const result = await SearchService.search(q);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Search completed",
    data: result,
  });
});

export const SearchController = {
  search,
};

