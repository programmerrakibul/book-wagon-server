import { Router } from "express";
import categoryController from "../controller/category.js";

const router = Router();

router.get("/", categoryController.getCategories);
router.post("/", categoryController.createCategory);

export default router;
