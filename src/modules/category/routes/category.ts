import controllers from "@/category/controller/category.js";
import { Router } from "express";

const router = Router();

router.get("/", controllers.getCategories);
router.post("/", controllers.createCategory);

export default router;
