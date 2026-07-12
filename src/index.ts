import bookFormatRouter from "@/book-format/routes/book-format.js";
import booksRouter from "@/book/routes/book.js";
import categoryRouter from "@/category/routes/category.js";
import { checkoutRouter } from "@/checkout/routes/checkout.js";
import { commentsRouter } from "@/comment/routes/comment.js";
import { dbConnect } from "@/config/db.js";
import { envConfig } from "@/config/env.js";
import { dashboardRouter } from "@/dashboard/routes/dashboard.js";
import { favoritesRouter } from "@/favorite/routes/favorite.js";
import { healthCheck } from "@/health/controller/health.js";
import { globalErrorHandler } from "@/middlewares/global-error-handler.js";
import { ordersRouter } from "@/order/routes/order.js";
import { paymentsRouter } from "@/payment/routes/payment.js";
import subCategoryRouter from "@/sub-category/routes/sub-category.js";
import { usersRouter } from "@/user/routes/user.js";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "@/utils/sendResponse.js";
import cors from "cors";
import type { Request, Response } from "express";
import express, { json } from "express";
import status from "http-status";

import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();
const port = envConfig.PORT;
const API_PREFIX = "/api" as const;

// Middlewares
app.use(cors());
app.use(json());

const run = async () => {
  try {
    await dbConnect();

    app.get("/", (_req: Request, res: Response) => {
      return sendSuccessResponse(res, status.OK, {
        message: "Server is up and running!",
      });
    });

    app.get(`${API_PREFIX}/health-check`, healthCheck);

    app.use(`${API_PREFIX}/users`, usersRouter);
    app.use(`${API_PREFIX}/books`, booksRouter);
    app.use(`${API_PREFIX}/orders`, ordersRouter);
    app.use(`${API_PREFIX}/checkout`, checkoutRouter);
    app.use(`${API_PREFIX}/payments`, paymentsRouter);
    app.use(`${API_PREFIX}/favorites`, favoritesRouter);
    app.use(`${API_PREFIX}/comments`, commentsRouter);
    app.use(`${API_PREFIX}/dashboard`, dashboardRouter);
    app.use(`${API_PREFIX}/categories`, categoryRouter);
    app.use(`${API_PREFIX}/sub-categories`, subCategoryRouter);
    app.use(`${API_PREFIX}/book-formats`, bookFormatRouter);

    app.use((_req: Request, res: Response) => {
      return sendErrorResponse(res, status.NOT_FOUND, {
        message: "Route not found!",
      });
    });

    app.use(globalErrorHandler);

    // Start the server
    app.listen(port, () => console.log("Server is running on port: " + port));
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

run();
