import { authClient } from "@/lib/auth-client";
import { axiosInstance } from "@/lib/axios";
import { catchAsync } from "@/lib/catchAsync";

export const authService = {
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

  logout: catchAsync(async () => {
    await axiosInstance.post("/api/v1/auth/logout");
  }),

  googleLogin: catchAsync(async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/auth/callback`,
    });
  }),

  googleLoginSuccess: catchAsync(async (redirectPath?: string) => {
    const response = await axiosInstance.get("/api/v1/auth/google/callback", {
      params: { redirect: redirectPath },
    });
    return response.data;
  }),

  facebookLogin: catchAsync(async () => {
    await authClient.signIn.social({
      provider: "facebook",
      callbackURL: `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/auth/callback`,
    });
  }),

  getSession: catchAsync(async () => {
    const response = await authClient.getSession();
    return response.data ?? null;
  }),
};
