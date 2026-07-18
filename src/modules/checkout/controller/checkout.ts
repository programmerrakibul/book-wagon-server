import services from "@/checkout/service/checkout.js";
import { sendSuccessResponse } from "@/utils/sendResponse.js";
import type { Request, Response } from "express";
import status from "http-status";

const createCheckout = async (req: Request<{ orderID: string }>, res: Response) => {
  const { orderID } = req.params;
  const { email } = req.user;

  const sessionUrl = await services.createCheckout(orderID, email);

  sendSuccessResponse(res, status.OK, {
    message: "Checkout created successfully!",
    data: sessionUrl,
  });
};

const retrieveCheckout = async (req: Request<{ id: string }>, res: Response) => {
  const result = await services.retrieveCheckout(req.params.id);

  sendSuccessResponse(res, status.OK, {
    message: result.alreadyProcessed
      ? "Payment already exist"
      : "Payment successful!",
    data: { transactionId: result.transactionId, orderID: result.orderID },
  });
};

const controllers = {
  createCheckout,
  retrieveCheckout,
};

export default controllers;
