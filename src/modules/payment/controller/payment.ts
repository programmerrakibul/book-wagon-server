import services from "@/payment/service/payment.js";
import { sendSuccessResponse } from "@/utils/sendResponse.js";
import type { Request, Response } from "express";
import status from "http-status";

const getInvoices = async (req: Request, res: Response) => {
  const { email: customerEmail } = req.user;
  const result = await services.getInvoices(req.query, customerEmail);

  sendSuccessResponse(res, status.OK, {
    message: "Invoices data retrieved successfully!",
    ...result,
  });
};

const controllers = {
  getInvoices,
};

export default controllers;
