import type { TCartDocument } from "@/cart/interface/cart.js";
import { Cart } from "@/cart/model/cart.js";
import { addToCartSchema, updateCartItemSchema } from "@/cart/validation/cart.js";
import Book from "@/book/model/book.js";
import { BookStatus } from "@/book/validation/book.js";
import { parseOrThrow, validateObjectId } from "@/utils/utils.js";
import { BadRequestError, NotFoundError } from "http-errors-enhanced";
import type { Types } from "mongoose";

const getCart = async (userId: Types.ObjectId) => {
  const cart: TCartDocument | null = await Cart.findOne({ userId }).populate({
    path: "items.bookId",
    select: "name author photoUrl price discount discountedPrice stock isActive status",
  });

  if (!cart) {
    return { items: [], totalItems: 0, totalPrice: 0 };
  }

  const activeItems = cart.items.filter((item) => {
    const book = item.bookId as unknown as {
      isActive: boolean;
      status: string;
    };
    return book.isActive && book.status === BookStatus.PUBLISHED;
  });

  const totalItems = activeItems.reduce((sum, item) => sum + item.quantity, 0);

  const totalPrice = activeItems.reduce((sum, item) => {
    const book = item.bookId as unknown as {
      price: number;
      discountedPrice: number;
      discount: number;
    };
    const itemPrice = book.discount ? book.discountedPrice || book.price : book.price;
    return sum + itemPrice * item.quantity;
  }, 0);

  return {
    items: cart.items,
    totalItems,
    totalPrice: parseFloat(totalPrice.toFixed(2)),
  };
};

const addToCart = async (userId: Types.ObjectId, payload: unknown) => {
  const parsedData = parseOrThrow(addToCartSchema, payload);

  const book = await Book.findById(parsedData.bookId);

  if (!book) {
    throw new NotFoundError("Book not found!");
  }

  if (book.status === BookStatus.UNPUBLISHED || !book.isActive) {
    throw new BadRequestError("Book is not available!");
  }

  if (book.stock < parsedData.quantity) {
    throw new BadRequestError(`Book ${book.name} is out of stock!`);
  }

  let cart: TCartDocument | null = await Cart.findOne({ userId });

  if (!cart) {
    cart = new Cart({ userId, items: [] });
  }

  const existingItemIndex = cart.items.findIndex(
    (item) => item.bookId.toString() === parsedData.bookId.toString(),
  );

  if (existingItemIndex > -1) {
    const item = cart.items[existingItemIndex];
    if (item) {
      item.quantity += parsedData.quantity;
    }
  } else {
    cart.items.push({
      bookId: parsedData.bookId,
      quantity: parsedData.quantity,
      addedAt: new Date(),
    });
  }

  await cart.save();
};

const updateCartItem = async (
  userId: Types.ObjectId,
  bookId: string,
  payload: unknown,
) => {
  if (!validateObjectId(bookId)) {
    throw new NotFoundError("Book not found!");
  }

  const parsedData = parseOrThrow(updateCartItemSchema, payload);

  const cart: TCartDocument | null = await Cart.findOne({ userId });

  if (!cart) {
    throw new NotFoundError("Cart not found!");
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.bookId.toString() === bookId,
  );

  if (itemIndex === -1) {
    throw new NotFoundError("Item not found in cart!");
  }

  const book = await Book.findById(bookId);

  if (!book) {
    throw new NotFoundError("Book not found!");
  }

  if (book.stock < parsedData.quantity) {
    throw new BadRequestError(`Book ${book.name} is out of stock!`);
  }

  const item = cart.items[itemIndex];
  if (item) {
    item.quantity = parsedData.quantity;
  }

  await cart.save();
};

const removeFromCart = async (userId: Types.ObjectId, bookId: string) => {
  if (!validateObjectId(bookId)) {
    throw new NotFoundError("Book not found!");
  }

  const cart: TCartDocument | null = await Cart.findOne({ userId });

  if (!cart) {
    throw new NotFoundError("Cart not found!");
  }

  cart.items = cart.items.filter(
    (item) => item.bookId.toString() !== bookId,
  );

  await cart.save();
};

const clearCart = async (userId: Types.ObjectId) => {
  await Cart.findOneAndUpdate(
    { userId },
    { items: [] },
    { upsert: true },
  );
};

const services = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};

export default services;
