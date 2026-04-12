import type z from "zod";
import type { Document } from "mongoose";
import type {
  BookCategory,
  BookFormat,
  bookQuerySchema,
  BookStatus,
  createBookSchema,
} from "@/validators/book.validator.js";

export type TBookFormat = (typeof BookFormat)[keyof typeof BookFormat];
export type IBookCategory = (typeof BookCategory)[keyof typeof BookCategory];
export type TBookStatus = (typeof BookStatus)[keyof typeof BookStatus];

export type TCreateBook = z.infer<typeof createBookSchema> & {
  librarianEmail: string;
};
export type TUpdateBook = Partial<TCreateBook>;
export type TBookQuery = z.infer<typeof bookQuerySchema>;

export interface TBookDocument extends Document, TCreateBook {}
export interface TBookCategory {
  _id: number;
  name: string;
}
