import { Router } from "express";
import { UserController } from "./user.controller.js";
import { authMiddleware } from "@/middlewares/auth.middleware.js";

const router = Router();

router.get("/", UserController.getUser);
router.get("/me/profile", authMiddleware, UserController.getProfile);
router.get("/admin/dashboard", authMiddleware, UserController.getAdminDashboard);
router.patch("/admin/users", authMiddleware, UserController.adminActionUsers);

export const UserRoutes = router;
