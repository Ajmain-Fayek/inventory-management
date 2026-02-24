import { Request, Response, NextFunction } from "express";
import { AppError } from "../errorHelper/AppError.js";
import { auth } from "../lib/auth.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: string;
        status: string;
        emailVerified: boolean;
      };
    }
  }
}

/**
 * authMiddleware
 * ------------
 * Verifies the request by reading the better-auth session cookie.
 * Sets req.user so downstream handlers can access the current user.
 *
 * Strategy: use better-auth as the single source of truth for sessions.
 * Tokens in HttpOnly cookies are sent automatically by the browser (withCredentials:true),
 * so no manual Authorization header is needed.
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Forward all incoming headers (including Cookie) to better-auth's session resolver
    const session = await auth.api.getSession({
      headers: req.headers as Record<string, string>,
    });

    if (!session || !session.user) {
      throw new AppError("Unauthorized – please log in", 401);
    }

    const user = session.user as typeof session.user & {
      role?: string;
      status?: string;
    };

    if (user.status === "BLOCKED") {
      throw new AppError("Your account has been blocked by an admin", 403);
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role ?? "USER",
      status: user.status ?? "ACTIVE",
      emailVerified: user.emailVerified,
    };

    next();
  } catch (err) {
    next(err);
  }
};

/**
 * roleMiddleware
 * -------------
 * Factory that returns a middleware restricting access to the given roles.
 * Must be used AFTER authMiddleware (relies on req.user being populated).
 *
 * Usage:
 *   router.get("/admin-only", authMiddleware, roleMiddleware(["ADMIN"]), handler)
 */
export const roleMiddleware =
  (allowedRoles: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Forbidden – requires one of: ${allowedRoles.join(", ")}`,
          403,
        ),
      );
    }

    next();
  };
