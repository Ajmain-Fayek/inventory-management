import { createAuthClient } from "better-auth/client";
import { envConfig } from "@/config/envConfig";

/**
 * Singleton better-auth client.
 * baseURL points to the BACKEND where better-auth is mounted.
 */
export const authClient = createAuthClient({
  baseURL: envConfig.BACKEND_BASE_URL,
});
