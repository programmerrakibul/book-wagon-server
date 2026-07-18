import controllers from "@/book/controller/book.js";
import { authorize } from "@/middlewares/authorize.js";
import { validateId } from "@/middlewares/validate-id.js";
import { verifyTokenID } from "@/middlewares/verify-token.js";
import { UserRole } from "@/user/validation/user.js";
import { Router } from "express";

const LIBRARIAN = UserRole.LIBRARIAN;
const ADMIN = UserRole.ADMIN;
const LIBRARIAN_ADMIN = [LIBRARIAN, ADMIN];

const router = Router();

router.get("/", controllers.getBooks);

router.post("/", verifyTokenID, authorize(LIBRARIAN), controllers.createBook);

router.get("/:id", validateId, controllers.getBookById);

router.put(
  "/:id",
  validateId,
  verifyTokenID,
  authorize(LIBRARIAN),
  controllers.updateBookById,
);

router.patch(
  "/:id/status",
  validateId,
  verifyTokenID,
  authorize(LIBRARIAN),
  controllers.updateBookStatusById,
);

router.patch(
  "/:id/active-status",
  validateId,
  verifyTokenID,
  authorize(ADMIN),
  controllers.updateBookActiveStatusById,
);

router.delete(
  "/:id",
  validateId,
  verifyTokenID,
  authorize(...LIBRARIAN_ADMIN),
  controllers.deleteBookById,
);

export default router;
