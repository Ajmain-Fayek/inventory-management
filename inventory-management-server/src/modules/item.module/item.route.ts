import { Router } from "express";
import { itemController } from "./item.controller.js";
import { authMiddleware } from "@/middlewares/auth.middleware.js";
import { inventoryOwnerOrAdmin } from "@/middlewares/inventoryOwnerOrAdmin.js";

const router = Router({ mergeParams: true });

router.post("/", authMiddleware, itemController.createItem);
router.get("/", itemController.getItems);
router.get("/:itemId", itemController.getItemById);
router.put("/:itemId", authMiddleware, inventoryOwnerOrAdmin, itemController.updateItem);
router.delete("/:itemId", authMiddleware, inventoryOwnerOrAdmin, itemController.deleteItem);

export const ItemRoutes = router;
