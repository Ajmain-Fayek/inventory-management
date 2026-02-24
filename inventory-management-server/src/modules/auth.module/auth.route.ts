import { Router } from "express";
import { authController } from "./auth.controller.js";
import { authMiddleware } from "@/middlewares/auth.middleware.js";

const router = Router();

// ── Public routes (no auth required) ─────────────────────────────────────────
router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/logout", authController.logoutUser);

// OAuth callback — called by the server after better-auth completes the flow.
// The actual OAuth initiation is handled entirely on the client via authClient.signIn.social()
// which redirects to better-auth's /api/auth/* endpoints.
router.get("/google/callback", authController.googleLoginSuccess);

// ── Protected routes (requires valid session) ─────────────────────────────────
router.get("/me", authMiddleware, authController.getMe);

export const AuthRoutes = router;
