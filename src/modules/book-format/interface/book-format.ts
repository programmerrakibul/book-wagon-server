import type { TCreateBookFormat } from "@/book-format/validation/book-format.js";
import type { Document } from "mongoose";

export interface TBookFormat extends Document, TCreateBookFormat {}
