import { Request, Response } from "express";
import status from "http-status";
import { AppError } from "@/errorHelper/AppError.js";
import { catchAsync } from "@/shared/catchAsync.js";
import { sendResponse } from "@/shared/sendResponse.js";
import { InventoryService } from "./inventory.service.js";

export const getParam = (value: string | string[] | undefined, key: string) => {
  if (typeof value !== "string" || value.length === 0) {
    throw new AppError(`Missing route parameter: ${key}`, status.BAD_REQUEST);
  }

  return value;
};

const createInventory = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", status.UNAUTHORIZED);
  }

  const { title, description, categoryName } = await req.body;

  console.log(title.trim(), description.trim(), categoryName.trim());

  if (!title.trim() || !description.trim() || !categoryName.trim()) {
    return sendResponse(res, {
      httpStatusCode: status.BAD_REQUEST,
      success: false,
      message: "Title, Description, Category required!",
    });
  }

  const result = await InventoryService.createInventory(req.user.id, await req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Inventory created successfully",
    data: result,
  });
});

const getInventoryById = catchAsync(async (req: Request, res: Response) => {
  const inventoryId = getParam(req.params.inventoryId, "inventoryId");
  const result = await InventoryService.getInventoryById(inventoryId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Inventory fetched successfully",
    data: result,
  });
});

const getInventories = catchAsync(async (req: Request, res: Response) => {
  const { page, recordLimit } = req.query;
  const options: { page: number; recordLimit: number } = {
    page: Number(page),
    recordLimit: Number(recordLimit),
  };
  const result = await InventoryService.getInventories(options);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Inventories fetched successfully",
    data: result.data,
    meta: result.pagination,
  });
});

const updateInventory = catchAsync(async (req: Request, res: Response) => {
  const inventoryId = getParam(req.params.inventoryId, "inventoryId");

  const { customFieldConfig, customIdTemplates, tags, writeAccess, ...rest } = await req.body;

  const inventoryPayload = {
    ...customFieldConfig,
    ...rest,
  };

  await InventoryService.updateInventory(
    inventoryId as string,
    inventoryPayload,
    customIdTemplates,
    tags,
    writeAccess,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    message: "Inventory Updated successfully.",
    success: true,
  });
});

const lockInventory = catchAsync(async (req: Request, res: Response) => {
  const inventoryId = getParam(req.params.inventoryId, "inventoryId");
  const userId = req.user?.id;

  await InventoryService.lockInventory(inventoryId, userId!);

  sendResponse(res, {
    httpStatusCode: status.OK,
    message: "Inventory locked succesfully",
    success: true,
  });
});

const releaseInventory = catchAsync(async (req: Request, res: Response) => {
  const inventoryId = getParam(req.params.inventoryId, "inventoryId");

  await InventoryService.releaseInventory(inventoryId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    message: "Inventory released succesfully",
    success: true,
  });
});

export const inventoryController = {
  createInventory,
  getInventoryById,
  updateInventory,
  getInventories,
  lockInventory,
  releaseInventory,
};
