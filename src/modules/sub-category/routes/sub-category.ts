import subCategoryController from "@/sub-category/controller/sub-category.js";
import { Router } from "express";

const router = Router();

router.get("/", subCategoryController.getSubCategories);
router.post("/", subCategoryController.createSubCategory);

export default router;
