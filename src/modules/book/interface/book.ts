import type { Document } from "mongoose";
import type { TCreateBook } from "../validation/book.js";

export interface TBook extends Document, TCreateBook {
  librarianEmail: string;
  discountedPrice: number;
  isActive: boolean;
}
