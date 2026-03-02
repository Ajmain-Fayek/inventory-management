import { Router } from "express";
import { authMiddleware } from "@/middlewares/auth.middleware.js";
import { validateRequest } from "@/middlewares/validateRequestBody.js";
import { itemController } from "./item.controller.js";
import { createItemSchema, updateItemSchema } from "./item.validation.js";

const router = Router({ mergeParams: true });

router.post("/", authMiddleware, validateRequest(createItemSchema), itemController.createItem);
router.get("/", itemController.getItems);
router.get("/:itemId", itemController.getItemById);
router.patch(
  "/:itemId",
  authMiddleware,
  validateRequest(updateItemSchema),
  itemController.updateItem,
);

export const ItemRoutes = router;
