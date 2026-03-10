import { envConfig } from "@/config/envConfig";
import { createAuthClient } from "better-auth/client";

/**
 * Singleton better-auth client.
 * baseURL points to the BACKEND where better-auth is mounted.
 */

const baseURL = envConfig.FRONTEND_BASE_URL
  ? `${envConfig.FRONTEND_BASE_URL}/api/proxy`
  : "/api/proxy";

export const authClient = createAuthClient({
  baseURL: baseURL,
  fetchOptions: {
    credentials: "include",
  },
});
