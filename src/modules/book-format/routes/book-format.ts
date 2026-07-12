import controllers from "@/book-format/controller/book-format.js";
import { Router } from "express";

const router = Router();

router.get("/", controllers.getBookFormats);
router.post("/", controllers.createBookFormat);

export default router;
