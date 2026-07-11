import { Router } from "express";
import subCategoryController from "../controller/sub-category.js";

const router = Router();

router.get("/", subCategoryController.getSubCategories);
router.post("/", subCategoryController.createSubCategory);

export default router;
