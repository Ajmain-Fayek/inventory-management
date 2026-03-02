import "dotenv/config";
import express, { Application, Request, Response } from "express";
// @ts-ignore
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import envConfig from "./config/env.js";
import { IndexRouter } from "./routes/index.js";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.js";
import { notFound } from "./middlewares/notFound.js";
import cookierParser from "cookie-parser";

const app: Application = express();

app.use(
  cors({
    origin: envConfig.FRONTEND_BASE_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Better-auth
app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());
app.use(cookierParser());

// Routes
app.use("/api/v1", IndexRouter);

// Health Check Endpoint
app.get("/", (req: Request, res: Response) => {
  res.status(201).json({
    success: true,
    message: "Health OK",
  });
});

// Global Error Handler
app.use(globalErrorHandler);
app.use(notFound);

export default app;
