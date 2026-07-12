import controllers from "@/sub-category/controller/sub-category.js";
import { Router } from "express";

const router = Router();

router.get("/", controllers.getSubCategories);
router.post("/", controllers.createSubCategory);

export default router;
