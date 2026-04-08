import { Router } from "express";
import { authMiddleware } from "@/middlewares/auth.middleware.js";
import { inventoryController } from "./inventory.controller.js";
import { ItemRoutes } from "@/modules/item.module/item.route.js";
import { inventoryOwnerOrAdmin } from "@/middlewares/inventoryOwnerOrAdmin.js";

const router = Router();

router.post("/", authMiddleware, inventoryController.createInventory);
router.get("/", inventoryController.getInventories);
router.use("/:inventoryId/items", ItemRoutes);
router.get("/:inventoryId", inventoryController.getInventoryById);
router.put(
  "/:inventoryId/lock",
  authMiddleware,
  inventoryOwnerOrAdmin,
  inventoryController.lockInventory,
);
router.put(
  "/:inventoryId/release",
  authMiddleware,
  inventoryOwnerOrAdmin,
  inventoryController.releaseInventory,
);

// Only for Beacon
router.post(
  "/:inventoryId/release",
  authMiddleware,
  inventoryOwnerOrAdmin,
  inventoryController.releaseInventory,
);

router.put(
  "/:inventoryId",
  authMiddleware,
  inventoryOwnerOrAdmin,
  inventoryController.updateInventory,
);
router.delete(
  "/:inventoryId",
  authMiddleware,
  inventoryOwnerOrAdmin,
  inventoryController.deleteInventory,
);

export const InventoryRoutes = router;
