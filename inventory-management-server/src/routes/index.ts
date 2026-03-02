import { AuthRoutes } from "@/modules/auth.module/auth.route.js";
import { CategoryRoutes } from "@/modules/category.module/category.route.js";
import { InventoryRoutes } from "@/modules/inventory.module/inventory.route.js";
import { TagRoutes } from "@/modules/tag.module/tag.route.js";
import { Router } from "express";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/inventories", InventoryRoutes);
router.use("/categories", CategoryRoutes);
router.use("/tags", TagRoutes);

export const IndexRouter = router;
