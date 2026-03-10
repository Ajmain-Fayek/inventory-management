import "dotenv/config";
import { AppError } from "@/errorHelper/AppError.js";

interface EnvConfig {
  PORT?: number;
  DATABASE_URL: string;
  BACKEND_BASE_URL: string;
  FRONTEND_BASE_URL: string;
  EMAIL_SENDER_PASS: string;
  EMAIL_SENDER_USER: string;
  EMAIL_SENDER_NAME: string;
  EMAIL_SENDER_FROM: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_CALLBACK_URL: string;
  FACEBOOK_CLIENT_ID: string;
  FACEBOOK_CLIENT_SECRET: string;
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;
  JWT_SECRET: string;
  NODE_ENV: string;
  ACCESS_TOKEN_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
  ACCESS_TOKEN_EXPIRES_IN: string;
  REFRESH_TOKEN_EXPIRES_IN: string;
  BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN: string;
  BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE: string;
}

const requiredEnvVars = [
  "DATABASE_URL",
  "BACKEND_BASE_URL",
  "FRONTEND_BASE_URL",
  "EMAIL_SENDER_PASS",
  "EMAIL_SENDER_USER",
  "EMAIL_SENDER_NAME",
  "EMAIL_SENDER_FROM",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_CALLBACK_URL",
  "FACEBOOK_CLIENT_ID",
  "FACEBOOK_CLIENT_SECRET",
  "BETTER_AUTH_URL",
  "BETTER_AUTH_SECRET",
  "JWT_SECRET",
  "NODE_ENV",
  "ACCESS_TOKEN_SECRET",
  "REFRESH_TOKEN_SECRET",
  "ACCESS_TOKEN_EXPIRES_IN",
  "REFRESH_TOKEN_EXPIRES_IN",
  "BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN",
  "BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE",
];

function getEnvConfig(): EnvConfig {
  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new AppError(`Missing required environment variables: ${missingVars.join(", ")}`, 500);
  }

  return {
    PORT: process.env.PORT ? Number(process.env.PORT) : 3000,
    DATABASE_URL: process.env.DATABASE_URL as string,
    BACKEND_BASE_URL: process.env.BACKEND_BASE_URL as string,
    FRONTEND_BASE_URL: process.env.FRONTEND_BASE_URL as string,
    EMAIL_SENDER_PASS: process.env.EMAIL_SENDER_PASS as string,
    EMAIL_SENDER_USER: process.env.EMAIL_SENDER_USER as string,
    EMAIL_SENDER_NAME: process.env.EMAIL_SENDER_NAME as string,
    EMAIL_SENDER_FROM: process.env.EMAIL_SENDER_FROM as string,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL as string,
    FACEBOOK_CLIENT_ID: process.env.FACEBOOK_CLIENT_ID as string,
    FACEBOOK_CLIENT_SECRET: process.env.FACEBOOK_CLIENT_SECRET as string,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL as string,
    JWT_SECRET: process.env.JWT_SECRET as string,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET as string,
    NODE_ENV: process.env.NODE_ENV as string,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET as string,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET as string,
    ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN as string,
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN as string,
    BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN: process.env
      .BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN as string,
    BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE: process.env
      .BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE as string,
  };
}

const envConfig = getEnvConfig();

export default envConfig;
