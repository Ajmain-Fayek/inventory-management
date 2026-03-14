import { envConfig } from "@/config/envConfig";
import { createAuthClient } from "better-auth/client";

const baseURL = envConfig.FRONTEND_BASE_URL
  ? `${envConfig.FRONTEND_BASE_URL}/api/proxy/api/auth`
  : "/api/proxy/api/auth";

export const authClient = createAuthClient({
  baseURL: baseURL,
  fetchOptions: {
    credentials: "include",
  },
});
