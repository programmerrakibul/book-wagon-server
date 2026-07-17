import type { TPaymentDocument } from "@/payment/interface/payment.js";
import { Payment } from "@/payment/model/payment.js";
import { paymentQuerySchema } from "@/payment/validation/payment.js";
import { getPaginatedData } from "@/utils/getPaginatedData.js";
import { parseOrThrow } from "@/utils/utils.js";
import type { PaginateOptions, PaginateResult } from "mongoose";

const getInvoices = async (queryPayload: unknown, customerEmail: string) => {
  const sort: Record<string, 1 | -1> = {
    createdAt: -1,
  };

  const {
    sortBy,
    sortOrder,
    limit = 10,
    page = 1,
  } = parseOrThrow(paymentQuerySchema, queryPayload);

  if (sortBy && sortOrder) {
    const order = sortOrder === "desc" ? -1 : 1;
    sort[sortBy] = order;
  }

  const opt: PaginateOptions = {
    limit,
    page,
    sort,
    populate: [
      {
        path: "bookId",
        select: "name author photoUrl",
      },
      {
        path: "orderID",
        select: "orderID status",
      },
    ],
  };

  const result: PaginateResult<TPaymentDocument> = await Payment.paginate(
    { customer_email: customerEmail },
    opt,
  );

  return getPaginatedData(result);
};

const services = {
  getInvoices,
};

export default services;
