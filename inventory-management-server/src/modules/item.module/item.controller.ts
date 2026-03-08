import { sendResponse } from "@/shared/sendResponse.js";
import { AppError } from "@/errorHelper/AppError.js";
import { catchAsync } from "@/shared/catchAsync.js";
import { ItemService } from "./item.service.js";
import { Request, Response } from "express";
import status from "http-status";

const getParam = (value: string | string[] | undefined, key: string) => {
  if (typeof value !== "string" || value === "undefined" || value.length === 0) {
    throw new AppError(`Missing route parameter: ${key}`, status.BAD_REQUEST);
  }

  return value;
};

const getItems = catchAsync(async (req: Request, res: Response) => {
  const inventoryId = getParam(req.params.inventoryId, "inventoryId");
  const { page, recordLimit } = req.query;

  const options: { page: number; recordLimit: number } = {
    page: Number(page),
    recordLimit: Number(recordLimit),
  };

  const result = await ItemService.getItems(inventoryId, options);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Items fetched successfully",
    data: result.data,
    meta: result.pagination,
  });
});

const getItemById = catchAsync(async (req: Request, res: Response) => {
  const itemId = getParam(req.params.itemId, "itemId");
  const result = await ItemService.getItemById(itemId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Items fetched successfully",
    data: result,
  });
});

const createItem = catchAsync(async (req: Request, res: Response) => {
  const inventoryId = getParam(req.params.inventoryId, "inventoryId");

  const payload = await req.body;

  if (!payload) {
    throw new AppError(`Missing item payload or invalid payload`, status.BAD_REQUEST);
  }

  const result = await ItemService.createItem(inventoryId, payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Items created successfully",
    data: result,
  });
});

const updateItem = catchAsync(async (req: Request, res: Response) => {
  const inventoryId = getParam(req.params.inventoryId, "inventoryId");
  const itemId = getParam(req.params.itemId, "itemId");

  const payload = await req.body;

  console.log(payload, inventoryId, itemId);

  if (!payload) {
    throw new AppError(`Missing item payload or invalid payload`, status.BAD_REQUEST);
  }

  // const result = await ItemService.upda(inventoryId, payload);

  console.log("payload", payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Items created successfully",
    data: { inventoryId, itemId },
  });
});

export const itemController = {
  createItem,
  getItemById,
  getItems,
  updateItem,
};
