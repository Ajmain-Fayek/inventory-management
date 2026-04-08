import { Router } from "express";
import { SearchController } from "./search.controller.js";

const router = Router();

router.get("/", SearchController.search);

export const SearchRoutes = router;

