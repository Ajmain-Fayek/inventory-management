import { AuthRoutes } from "@/modules/auth.module/auth.route.js";
import { Router } from "express";

const router = Router();

router.use("/auth", AuthRoutes);

export const IndexRouter = router;
