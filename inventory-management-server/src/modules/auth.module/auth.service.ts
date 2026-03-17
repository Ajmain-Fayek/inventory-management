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

  const data = await auth.api.signInEmail({
    body: { email, password },
  });

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

  const accessToken = await tokenUtils.getAccessToken({
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    status: user.status,
    emailVerified: user.emailVerified,
  });

  const refreshToken = await tokenUtils.getRefreshToken({
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    status: user.status,
    emailVerified: user.emailVerified,
  });

  // await prisma.account.update({
  //   where: { id: user.id },
  //   data: {
  //     accessToken,
  //     refreshToken,
  //   },
  // });

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

    const accessToken = tokenUtils.getAccessToken({
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      status: user.status,
      emailVerified: user.emailVerified,
    });

    const refreshToken = tokenUtils.getRefreshToken({
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      status: user.status,
      emailVerified: user.emailVerified,
    });

    return {
      ...data,
      accessToken,
      refreshToken,
      user,
    };
  } catch (error) {
    logger.error("Transaction error: ", error);
    // Clean up the better-auth user so the email can be re-used
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
  // Fetch the persisted user (better-auth already created it)
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

    const accessToken = tokenUtils.getAccessToken({
      userId: result.id,
      role: result.role,
      name: result.name,
      email: result.email,
      status: result.status,
      emailVerified: result.emailVerified,
    });

    const refreshToken = tokenUtils.getRefreshToken({
      userId: result.id,
      role: result.role,
      name: result.name,
      email: result.email,
      status: result.status,
      emailVerified: result.emailVerified,
    });

    return { accessToken, refreshToken, user: result };
  }

  if (user.status === "BLOCKED") {
    throw new AppError("Your account has been blocked by an admin", 403);
  }

  const accessToken = tokenUtils.getAccessToken({
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    status: user.status,
    emailVerified: user.emailVerified,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    status: user.status,
    emailVerified: user.emailVerified,
  });

  return { accessToken, refreshToken, user };
};

export const AuthService = {
  loginUser,
  registerUser,
  googleLoginSuccess,
};
