import { Payment } from "../models/payment.model.js";
import { paymentQuerySchema } from "../validations/payment.validator.js";

import type { NextFunction, Request, Response } from "express";
import type { Aggregate, PaginateOptions, PipelineStage } from "mongoose";
import type { TPaginatedResponse } from "../types/index.interface.js";
import type {
  TPaymentDocument,
  TPaymentQuery,
} from "../types/payment.interface.js";

export const getInvoices = async (
  req: Request<{}, {}, {}, TPaymentQuery>,
  res: Response<TPaginatedResponse<TPaymentDocument>>,
  next: NextFunction,
) => {
  try {
    const { email: customer_email } = req.user;

    const {
      sortBy,
      sortOrder,
      limit = 10,
      page = 1,
    } = paymentQuerySchema.parse(req.query);

    const sort: Record<string, 1 | -1> = {
      createdAt: -1,
    };

    if (sortBy && sortOrder) {
      const order = sortOrder === "desc" ? -1 : 1;
      sort[sortBy] = order;
    }

    const opt: PaginateOptions = {
      limit,
      page,
      sort,
    };

    const pipeline: PipelineStage[] = [
      {
        $match: {
          customer_email,
        },
      },
      {
        $addFields: {
          objectId: { $toObjectId: "$bookId" },
        },
      },
      {
        $lookup: {
          from: "books",
          localField: "objectId",
          foreignField: "_id",
          as: "book",
        },
      },
      {
        $unwind: "$book",
      },
      {
        $addFields: {
          bookName: "$book.bookName",
        },
      },
      {
        $project: {
          book: 0,
          bookId: 0,
          objectId: 0,
          customer_email: 0,
          librarianEmail: 0,
          __v: 0,
        },
      },
    ];

    const aggregate: Aggregate<TPaymentDocument[]> =
      Payment.aggregate(pipeline);
    const { docs, totalDocs, hasNextPage, hasPrevPage, totalPages } =
      await Payment.aggregatePaginate(aggregate, opt);

    res.send({
      success: true,
      message: "Invoices data retrieved successfully!.",
      data: docs,
      pagination: {
        totalDocs,
        hasNextPage,
        hasPrevPage,
        totalPages,
      },
    });
  } catch (err) {
    next(err);
  }
};
