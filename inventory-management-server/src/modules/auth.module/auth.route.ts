import { Router } from "express";
import { authController } from "./auth.controller.js";
import { authMiddleware } from "@/middlewares/auth.middleware.js";

const router = Router();

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/logout", authController.logoutUser);

router.get("/google/callback", authController.googleLoginSuccess);

router.get("/me", authMiddleware, authController.getMe);

export const AuthRoutes = router;
