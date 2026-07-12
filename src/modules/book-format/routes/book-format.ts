import controller from "@/book-format/controller/book-format.js";
import { Router } from "express";

const router = Router();

router.get("/", controller.getBookFormats);
router.post("/", controller.createBookFormat);

export default router;
