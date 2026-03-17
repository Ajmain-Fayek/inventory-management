import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../errorHelper/AppError.js";
import { auth } from "@/lib/auth.js";
import { logger } from "better-auth";
import status from "http-status";
import { ILoginPayload, IRegisterPayload } from "./auth.interface.js";
import { tokenUtils } from "@/utils/token.js";

//----------------------------------------
//            Login User
//----------------------------------------
const loginUser = async (payload: ILoginPayload) => {
  const { email, password } = payload;

  let data;
  try {
    data = await auth.api.signInEmail({
      body: { email, password },
    });
  } catch (error: any) {
    if (error.status === 401 || error.message?.includes("already exists")) {
      throw new AppError("Invalid email or password.", status.UNAUTHORIZED);
    }
    throw error;
  }

  const user = data.user as typeof data.user & {
    role?: string;
    status?: string;
  };

  if (user.status === "BLOCKED") {
    await auth.api.signOut({
      headers: { Cookie: `better-auth.session_token=${data.token}` },
    });
    throw new AppError("Your account has been blocked by an admin", 403);
  }

  const tokenPaylod = {
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    status: user.status,
    emailVerified: user.emailVerified,
  };

  const [accessToken, refreshToken] = await Promise.all([
    tokenUtils.getAccessToken(tokenPaylod),
    tokenUtils.getRefreshToken(tokenPaylod),
  ]);

  return {
    ...data,
    accessToken,
    refreshToken,
  };
};

//----------------------------------------
//          Register User
//----------------------------------------
const registerUser = async (payload: IRegisterPayload) => {
  const { name, email, password } = payload;

  let data;
  try {
    data = await auth.api.signUpEmail({
      body: { name, email, password },
    });
  } catch (error: any) {
    if (error.status === 400 || error.message?.includes("already exists")) {
      throw new AppError("User already exists. Use another email.", status.BAD_REQUEST);
    }
    throw error;
  }

  if (!data.user) {
    throw new AppError("Failed to register user", status.BAD_REQUEST);
  }

  try {
    const user = await prisma.$transaction(async (tx) => {
      return tx.user.update({
        where: { id: data.user.id },
        data: {
          role: "USER",
          status: "ACTIVE",
        },
      });
    });

    const tokenPaylod = {
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      status: user.status,
      emailVerified: user.emailVerified,
    };

    const [accessToken, refreshToken] = await Promise.all([
      tokenUtils.getAccessToken(tokenPaylod),
      tokenUtils.getRefreshToken(tokenPaylod),
    ]);

    return {
      ...data,
      accessToken,
      refreshToken,
      user,
    };
  } catch (error) {
    logger.error("Transaction error: ", error);
    await prisma.user.delete({ where: { id: data.user.id } });
    throw error;
  }
};

//----------------------------------------
//       Google / Social Login Success
//----------------------------------------
const googleLoginSuccess = async (session: {
  user: { id: string; role?: string; name: string; email?: string };
}) => {
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    const result = await prisma.user.create({
      data: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email!,
        role: "USER",
        status: "ACTIVE",
      },
    });

    if (!result) {
      throw new AppError("Failed to create user after social login", status.INTERNAL_SERVER_ERROR);
    }

    const tokenPaylod = {
      userId: result.id,
      role: result.role,
      name: result.name,
      email: result.email,
      status: result.status,
      emailVerified: result.emailVerified,
    };

    const [accessToken, refreshToken] = await Promise.all([
      tokenUtils.getAccessToken(tokenPaylod),
      tokenUtils.getRefreshToken(tokenPaylod),
    ]);

    return { accessToken, refreshToken, user: result };
  }

  if (user.status === "BLOCKED") {
    throw new AppError("Your account has been blocked by an admin", 403);
  }

  const tokenPaylod = {
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    status: user.status,
    emailVerified: user.emailVerified,
  };

  const [accessToken, refreshToken] = await Promise.all([
    tokenUtils.getAccessToken(tokenPaylod),
    tokenUtils.getRefreshToken(tokenPaylod),
  ]);

  return { accessToken, refreshToken, user };
};

export const AuthService = {
  loginUser,
  registerUser,
  googleLoginSuccess,
};
