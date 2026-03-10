import { createAuthClient } from "better-auth/client";

/**
 * Singleton better-auth client.
 * baseURL points to the BACKEND where better-auth is mounted.
 */
export const authClient = createAuthClient({
  baseURL: "/api/proxy",
});
