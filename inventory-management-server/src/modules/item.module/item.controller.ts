import { Request, Response } from "express";
import status from "http-status";
import { AppError } from "@/errorHelper/AppError.js";
import { catchAsync } from "@/shared/catchAsync.js";
import { sendResponse } from "@/shared/sendResponse.js";
import { ItemService } from "./item.service.js";

const getParam = (value: string | string[] | undefined, key: string) => {
  if (typeof value !== "string" || value.length === 0) {
    throw new AppError(`Missing route parameter: ${key}`, status.BAD_REQUEST);
  }

  return value;
};

const createItem = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", status.UNAUTHORIZED);
  }

  const inventoryId = getParam(req.params.inventoryId, "inventoryId");
  const result = await ItemService.createItem(inventoryId, req.user.id, req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Item created successfully",
    data: result,
  });
});

const listItemsByInventory = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", status.UNAUTHORIZED);
  }

  const inventoryId = getParam(req.params.inventoryId, "inventoryId");
  const result = await ItemService.listItemsByInventory(inventoryId, req.user.id);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Items fetched successfully",
    data: result,
  });
});

const getItemById = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", status.UNAUTHORIZED);
  }

  const inventoryId = getParam(req.params.inventoryId, "inventoryId");
  const itemId = getParam(req.params.itemId, "itemId");
  const result = await ItemService.getItemById(inventoryId, itemId, req.user.id);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Item fetched successfully",
    data: result,
  });
});

const updateItem = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", status.UNAUTHORIZED);
  }

  const inventoryId = getParam(req.params.inventoryId, "inventoryId");
  const itemId = getParam(req.params.itemId, "itemId");
  const result = await ItemService.updateItem(inventoryId, itemId, req.user.id, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Item updated successfully",
    data: result,
  });
});

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

export const itemController = {
  createItem,
  listItemsByInventory,
  getItemById,
  updateItem,
  getItems,
};
