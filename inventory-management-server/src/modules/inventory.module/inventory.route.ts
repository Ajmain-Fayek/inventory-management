import { Router } from "express";
import { authMiddleware } from "@/middlewares/auth.middleware.js";
import { validateRequest } from "@/middlewares/validateRequestBody.js";
import { inventoryController } from "./inventory.controller.js";
import { createInventorySchema, updateInventorySchema } from "./inventory.validation.js";
import { ItemRoutes } from "@/modules/item.module/item.route.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  validateRequest(createInventorySchema),
  inventoryController.createInventory,
);
router.get("/", inventoryController.getInventories);
router.use("/:inventoryId/items", ItemRoutes);
router.get("/:inventoryId", inventoryController.getInventoryById);

export const InventoryRoutes = router;
