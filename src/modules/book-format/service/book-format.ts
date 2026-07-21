import type { TBookFormat } from "@/book-format/interface/book-format.js";
import BookFormat from "@/book-format/model/book-format.js";
import { createBookFormatSchema } from "@/book-format/validation/book-format.js";
import { parseOrThrow } from "@/utils/utils.js";
import { ConflictError } from "http-errors-enhanced";

const createBookFormat = async (payload: unknown) => {
  const parsedData = parseOrThrow(createBookFormatSchema, payload);

  const existingBookFormat = await BookFormat.findOne({
    name: {
      $regex: new RegExp(`^${parsedData.name}$`, "i"),
    },
  });

  if (existingBookFormat) {
    throw new ConflictError("Book format already exists!");
  }

  await BookFormat.create(parsedData);
};

const getBookFormats = async () => {
  const result: TBookFormat[] = await BookFormat.find({}).sort({
    name: 1,
    createdAt: -1,
  });

  return result;
};

const services = {
  createBookFormat,
  getBookFormats,
};

export default services;
