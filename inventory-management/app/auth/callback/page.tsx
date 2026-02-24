"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

/**
 * Landing page for OAuth redirects (Google / Facebook).
 * better-auth completes the session server-side and redirects here.
 * We call refreshSession() to read the new session cookie and update state.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const { refreshSession } = useUser();

  useEffect(() => {
    const handleCallback = async () => {
      await refreshSession();
      router.replace("/");
    };

    handleCallback();
  }, [refreshSession, router]);

  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-default-500 text-sm">Completing sign in…</p>
    </div>
  );
}
