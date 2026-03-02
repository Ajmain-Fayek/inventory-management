import { Request, Response, NextFunction } from "express";
import { AppError } from "../errorHelper/AppError.js";
import { auth } from "../lib/auth.js";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma.js";
import envConfig from "@/config/env.js";
import { JWTPayload } from "better-auth";

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

// ──────────────────────────────────────────────────────────────────────────────
//              Authentication middleware
// ──────────────────────────────────────────────────────────────────────────────
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Forward all incoming headers (including Cookie) to better-auth's session resolver
    const session = await auth.api.getSession({
      headers: req.headers as Record<string, string>,
    });

    const accessToken = (await req.cookies["accessToken"]) || null;
    if (accessToken) {
      const data = jwt.verify(accessToken, envConfig.ACCESS_TOKEN_SECRET) as JWTPayload;

      const user = await prisma.user.findUnique({
        where: { id: data.userId as string },
      });

      if (!user) {
        throw new AppError("Unauthorized – user not found", 401);
      }

      if (user.status === "BLOCKED") {
        throw new AppError("Your account has been blocked by an admin", 403);
      }

      req.user = {
        id: data.userId as string,
        email: data.email as string,
        name: data.name as string,
        role: data.role as string,
        status: data.status as string,
        emailVerified: data.emailVerified as boolean,
      };

      return next();
    }

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
  (allowedRoles: string[]) => (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(`Forbidden – requires one of: ${allowedRoles.join(", ")}`, 403));
    }

    next();
  };
