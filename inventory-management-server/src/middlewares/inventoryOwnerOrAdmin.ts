import { AppError } from "@/errorHelper/AppError.js";
import { prisma } from "@/lib/prisma.js";
import { getParam } from "@/modules/inventory.module/inventory.controller.js";
import { Request, Response, NextFunction } from "express";
import status from "http-status";

export const inventoryOwnerOrAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const inventoryId = getParam(req.params.inventoryId, "inventoryId");
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!userId) {
    throw new AppError("UnAuthenticatedUser", status.UNAUTHORIZED);
  }

  if (userRole === "ADMIN") {
    return next();
  }

  const inventory = await prisma.inventory.findUnique({
    where: { id: inventoryId },
    select: {
      creatorId: true,
      isInEditMode: true,
      editingUserId: true,
      writeAccesses: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!inventory) {
    throw new AppError("Invenotry not found", status.NOT_FOUND);
  }

  // if in the proccess of update, don't allow other writeAccess user
  if (inventory.isInEditMode && inventory.editingUserId !== userId) {
    throw new AppError("Inventory is being updated. Re-try after a while", status.FORBIDDEN);
  }

  const isInventoryOwner = userId === inventory.creatorId;

  if (isInventoryOwner) {
    return next();
  }

  const hasWriteAccesses = inventory.writeAccesses.map((u) => u.userId).includes(userId);

  if (hasWriteAccesses) {
    return next();
  }

  throw new AppError("Unauthorized!", status.FORBIDDEN);
};
