import { Router } from "express";
import { TagController } from "./tag.controller.js";

const router = Router();

router.get("/", TagController.getTag);
router.post("/", TagController.createTag);

export const TagRoutes = router;
