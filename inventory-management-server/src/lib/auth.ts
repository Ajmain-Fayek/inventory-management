import "dotenv/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.js";
import { sendEmail } from "@/utils/email.js";
import envConfig from "@/config/env.js";
import ms, { StringValue } from "ms";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  experimental: {
    joins: true,
  },
  rateLimit: {
    window: 60,
    max: 100,
  },
  trustedOrigins: [envConfig.FRONTEND_BASE_URL],
  user: {
    additionalFields: {
      role: {
        type: "string",
        default: "USER",
        required: false,
      },
      status: {
        type: "string",
        default: "ACTIVE",
        required: false,
      },
    },
  },

  baseURL: envConfig.FRONTEND_BASE_URL,
  emailAndPassword: {
    enabled: true,
    // requireEmailVerification: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: `Verify your account for ${envConfig.EMAIL_SENDER_NAME}`,
        html: `<h2>Hello ${user.name},</h2>
               <p style="font-size: 16px;">Thank you for registering. Please verify your account by clicking the link below:</p>
               <a href="${url}">Verify Account</a>
               <p style="font-size: 16px;">This link will expire in 1 hour.</p>
               <p style="font-size: 16px;">if the above link doesn't work, copy and paste the following URL in your browser:</p>
               <p>${url}</p>`,
      });
    },
    sendOnSignUp: true,
    expiresIn: ms(envConfig.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN as StringValue),
  },
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: envConfig.GOOGLE_CLIENT_ID as string,
      clientSecret: envConfig.GOOGLE_CLIENT_SECRET as string,
    },
    facebook: {
      clientId: envConfig.FACEBOOK_CLIENT_ID as string,
      clientSecret: envConfig.FACEBOOK_CLIENT_SECRET as string,
    },
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: envConfig.NODE_ENV === "production" ? "lax" : "none",
      secure: true,
      // partitioned: envConfig.NODE_ENV === "production" ? true : false,
    },
  },
});
