import type { Document, Types } from "mongoose";
import type { TCreateBook } from "../validation/book.js";

export interface TBook extends Document, TCreateBook {
  librarianId: Types.ObjectId;
  discountedPrice: number;
  isActive: boolean;
}
