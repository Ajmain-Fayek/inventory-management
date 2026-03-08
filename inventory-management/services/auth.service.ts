import { authClient } from "@/lib/auth-client";
import { axiosInstance } from "@/lib/axios";
import { envConfig } from "@/config/envConfig";
import { catchAsync } from "@/lib/catchAsync";

export const authService = {
  // ── Email / Password ──────────────────────────────────────────────────────

  login: catchAsync(async (data: { email: string; password: string }) => {
    const response = await axiosInstance.post("/api/v1/auth/login", data);
    return response.data;
  }),

  register: catchAsync(async (data: { name: string; email: string; password: string }) => {
    const response = await axiosInstance.post("/api/v1/auth/register", data);
    return response.data;
  }),

  getCurrentUser: catchAsync(async () => {
    const response = await axiosInstance.get("/api/v1/auth/me");
    return response.data;
  }),

  // ── Logout ────────────────────────────────────────────────────────────────

  /**
   * Calls the server-side logout endpoint which invalidates the better-auth
   * session and clears all auth cookies (accessToken, refreshToken, session_token).
   */
  logout: catchAsync(async () => {
    await axiosInstance.post("/api/v1/auth/logout");
  }),

  // ── Social Providers ──────────────────────────────────────────────────────

  /**
   * Initiates Google OAuth flow.
   * better-auth will redirect the browser to Google, then back to callbackURL.
   */
  googleLogin: catchAsync(async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: `${envConfig.FRONTEND_BASE_URL}/auth/callback`,
    });
  }),

  googleLoginSuccess: catchAsync(async (redirectPath?: string) => {
    const response = await axiosInstance.get("/api/v1/auth/google/callback", {
      params: { redirect: redirectPath },
    });
    return response.data;
  }),

  /**
   * Initiates Facebook OAuth flow.
   */
  facebookLogin: catchAsync(async () => {
    await authClient.signIn.social({
      provider: "facebook",
      callbackURL: `${envConfig.FRONTEND_BASE_URL}/auth/callback`,
    });
  }),

  // ── Session ───────────────────────────────────────────────────────────────

  /**
   * Fetches the current session from the backend via better-auth.
   * The session cookie is sent automatically (withCredentials).
   * Returns { user, session } or null if not authenticated.
   */
  getSession: catchAsync(async () => {
    const response = await authClient.getSession();
    return response.data ?? null;
  }),
};
