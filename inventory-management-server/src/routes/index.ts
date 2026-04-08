import { AuthRoutes } from "@/modules/auth.module/auth.route.js";
import { CategoryRoutes } from "@/modules/category.module/category.route.js";
import { InventoryRoutes } from "@/modules/inventory.module/inventory.route.js";
import { TagRoutes } from "@/modules/tag.module/tag.route.js";
import { UserRoutes } from "@/modules/user.module/user.route.js";
import { SearchRoutes } from "@/modules/search.module/search.route.js";
import { Router } from "express";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/users", UserRoutes);
router.use("/inventories", InventoryRoutes);
router.use("/categories", CategoryRoutes);
router.use("/tags", TagRoutes);
router.use("/search", SearchRoutes);

export const IndexRouter = router;
