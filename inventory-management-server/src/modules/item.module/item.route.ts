import { Router } from "express";
import { itemController } from "./item.controller.js";

const router = Router({ mergeParams: true });

router.post("/", itemController.createItem);
router.get("/", itemController.getItems);
router.get("/:itemId", itemController.getItemById);
router.put("/:itemId", itemController.updateItem);

export const ItemRoutes = router;
