import type { TBook } from "@/book/interface/book.js";
import type { TOrder } from "@/order/interface/order.js";
import { Order } from "@/order/model/order.js";
import services from "@/order/service/order.js";
import {
  orderQuerySchema,
  type TOrderQuery,
  type TUpdateOrder,
} from "@/order/validation/order.js";
import type {
  TPaginatedResponse,
  TSuccessResponse,
} from "@/types/index.interface.js";
import { sendSuccessResponse } from "@/utils/sendResponse.js";
import type { NextFunction, Request, Response } from "express";
import { NotFoundError } from "http-errors-enhanced";
import status from "http-status";
import type { PaginateOptions } from "mongoose";

export const getAllOrders = async (
  req: Request<{}, {}, {}, TOrderQuery>,
  res: Response<TPaginatedResponse<{ orderedBook: TBook }>>,
  next: NextFunction,
) => {
  try {
    const sort: Record<string, 1 | -1> = {
      createdAt: -1,
    };

    const {
      limit = 10,
      page = 1,
      sortBy,
      sortOrder,
    } = orderQuerySchema.parse(req.query);

    if (sortBy && sortOrder) {
      const order = sortOrder === "desc" ? -1 : 1;
      sort[sortBy] = order;

      delete sort.createdAt;
    }

    const opt: PaginateOptions = {
      sort,
      limit,
      page,
    };

    const aggregate = Order.getOrdersByEmail(req.user.email);

    const result = await Order.aggregatePaginate(aggregate, opt);

    const { docs, ...pagination } = result;

    res.send({
      success: true,
      message: "Orders data retrieved successfully!",
      data: docs,
      pagination: {
        totalDocs: pagination.totalDocs,
        hasPrevPage: pagination.hasPrevPage,
        hasNextPage: pagination.hasNextPage,
        totalPages: pagination.totalPages,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const isOrdered = async (
  req: Request<{ id: string }>,
  res: Response<TSuccessResponse<boolean>>,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { email } = req.user;

    const result = await Order.isOrdered(id, email);

    res.send({
      success: true,
      message: "Order status retrieved successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const createOrder = async (req: Request, res: Response) => {
  const { _id } = req.user;
  await services.createOrder(req.body, _id);

  sendSuccessResponse(res, status.CREATED, {
    message: "Order created successfully!",
  });
};

export const updateOrder = async (
  req: Request<{ id: string }, {}, TUpdateOrder>,
  res: Response<TSuccessResponse>,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const order: TOrder | null = await Order.findById(id);

    if (!order) {
      throw new NotFoundError("Order data not found!");
    }

    await Order.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res.send({
      success: true,
      message: "Order data updated successfully!",
    });
  } catch (err) {
    next(err);
  }
};

const controllers = {
  getAllOrders,
  isOrdered,
  createOrder,
  updateOrder,
};

export default controllers;
