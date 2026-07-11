import categoryController from "@/category/controller/category.js";
import { Router } from "express";

const router = Router();

router.get("/", categoryController.getCategories);
router.post("/", categoryController.createCategory);

export default router;
