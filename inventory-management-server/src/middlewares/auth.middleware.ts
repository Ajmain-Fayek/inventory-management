import { Request, Response, NextFunction } from "express";
import { AppError } from "../errorHelper/AppError.js";
import { auth } from "../lib/auth.js";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma.js";
import envConfig from "@/config/env.js";
import { JWTPayload } from "better-auth";
import { fromNodeHeaders } from "better-auth/node";

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
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
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
