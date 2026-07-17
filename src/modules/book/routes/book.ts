import controllers from "@/book/controller/book.js";
import { authorize } from "@/middlewares/authorize.js";
import { verifyTokenID } from "@/middlewares/verify-token.js";
import { Router } from "express";

const router = Router();

router.get("/", controllers.getBooks);

router.post("/", verifyTokenID, authorize("librarian"), controllers.createBook);

router.get("/:id", controllers.getBookById);

router.put(
  "/:id",
  verifyTokenID,
  authorize("admin", "librarian"),
  controllers.updateBookById,
);

router.patch(
  "/:id",
  verifyTokenID,
  authorize("librarian"),
  controllers.updateBookStatusById,
);

router.delete(
  "/:id",
  verifyTokenID,
  authorize("admin", "librarian"),
  controllers.deleteBookById,
);

export default router;
