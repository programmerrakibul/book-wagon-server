import type { TCreateBook } from "@/book/validation/book.js";
import type { Document, Types } from "mongoose";

export interface TBook extends Document, TCreateBook {
  librarianId: Types.ObjectId;
  discountedPrice: number;
  isActive: boolean;
}
