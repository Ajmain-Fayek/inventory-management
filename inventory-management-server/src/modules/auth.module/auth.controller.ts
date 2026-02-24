import { NextFunction, Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import { AppError } from "../../errorHelper/AppError.js";
import { catchAsync } from "@/shared/catchAsync.js";
import envConfig from "@/config/env.js";
import { IRegisterPayload } from "./auth.interface.js";
import { tokenUtils } from "@/utils/token.js";
import { sendResponse } from "@/shared/sendResponse.js";
import status from "http-status";
import { auth } from "@/lib/auth.js";
import { CookieUtils } from "@/utils/cookie.js";

// ─── Login ───────────────────────────────────────────────────────────────────
const loginUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await AuthService.loginUser(payload);
  const { accessToken, refreshToken, token, ...rest } = result;

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User logged in successfully",
    data: rest,
  });
});

// ─── Register ─────────────────────────────────────────────────────────────────
const registerUser = catchAsync(async (req: Request, res: Response) => {
  const payload: IRegisterPayload = req.body;
  const result = await AuthService.registerUser(payload);
  const { accessToken, refreshToken, token, ...rest } = result;

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  // Use the better-auth session token (not the JWT accessToken) for the session cookie
  tokenUtils.setBetterAuthSessionCookie(res, token!);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "User registered successfully",
    data: rest,
  });
});

// ─── Logout ───────────────────────────────────────────────────────────────────
const logoutUser = catchAsync(async (req: Request, res: Response) => {
  // Tell better-auth to invalidate the session on the server
  try {
    await auth.api.signOut({
      headers: req.headers as Record<string, string>,
    });
  } catch {
    // Even if sign-out fails (e.g. session already expired), we still clear cookies
  }

  const cookieOptions = {
    httpOnly: true,
    secure: envConfig.NODE_ENV === "production",
    sameSite: "none" as const,
    path: "/",
    maxAge: 0,
  };

  CookieUtils.clearCookie(res, "accessToken", cookieOptions);
  CookieUtils.clearCookie(res, "refreshToken", cookieOptions);
  CookieUtils.clearCookie(res, "better-auth.session_token", cookieOptions);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Logged out successfully",
    data: null,
  });
});

// ─── Get Current User (me) ───────────────────────────────────────────────────
/**
 * Returns the currently authenticated user from req.user
 * (populated by authMiddleware).
 */
const getMe = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Current user fetched successfully",
    data: req.user,
  });
});

// ─── Google OAuth success callback ───────────────────────────────────────────
/**
 * Called by our backend after better-auth completes the OAuth flow.
 * Mints custom JWT tokens from the new session, sets cookies, then
 * redirects the browser back to the frontend.
 */
const googleLoginSuccess = catchAsync(async (req: Request, res: Response) => {
  const redirectPath = (req.query.redirect as string) || "/";

  const sessionToken = req.cookies?.["better-auth.session_token"];

  if (!sessionToken) {
    return res.redirect(`${envConfig.FRONTEND_BASE_URL}/auth/login?error=oauth_failed`);
  }

  const session = await auth.api.getSession({
    headers: {
      Cookie: `better-auth.session_token=${sessionToken}`,
    },
  });

  console.log(session);

  if (!session?.user) {
    return res.redirect(`${envConfig.FRONTEND_BASE_URL}/auth/login?error=no_session_found`);
  }

  const result = await AuthService.googleLoginSuccess(
    session as { user: { id: string; role?: string; name: string; email?: string } },
  );

  console.log(result);

  const { accessToken, refreshToken } = result;
  tokenUtils.setAccessTokenCookie(res, await accessToken);
  tokenUtils.setRefreshTokenCookie(res, await refreshToken);

  console.log(result);

  // Sanitise redirect to prevent open-redirect attacks
  const isValidRedirect = redirectPath.startsWith("/") && !redirectPath.startsWith("//");
  const finalRedirectPath = isValidRedirect ? redirectPath : "/";

  res.redirect(`${envConfig.FRONTEND_BASE_URL}${finalRedirectPath}`);
});

export const authController = {
  loginUser,
  registerUser,
  logoutUser,
  getMe,
  googleLoginSuccess,
};
