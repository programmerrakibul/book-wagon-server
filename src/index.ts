import bookFormatRouter from "@/book-format/routes/book-format.js";
import booksRouter from "@/book/routes/book.js";
import categoryRouter from "@/category/routes/category.js";
import { dbConnect } from "@/config/db.js";
import { envConfig } from "@/config/env.config.js";
import { globalErrorHandler } from "@/middlewares/global-error-handler.js";
import subCategoryRouter from "@/sub-category/routes/sub-category.js";
import cors from "cors";
import express, { json } from "express";
import { checkoutRouter } from "./routes/checkout.router.js";
import { commentsRouter } from "./routes/comment.router.js";
import { dashboardRouter } from "./routes/dashboard.router.js";
import { favoritesRouter } from "./routes/favorite.router.js";
import { ordersRouter } from "./routes/order.router.js";
import { paymentsRouter } from "./routes/payment.router.js";
import { usersRouter } from "./routes/user.router.js";

import type { Request, Response } from "express";
import { healthCheck } from "./controllers/health-check.controller.js";
import type {
  TErrorResponse,
  TSuccessResponse,
} from "./types/index.interface.js";

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

    app.get("/", (_req: Request, res: Response<TSuccessResponse>) => {
      res.send({ success: true, message: "Welcome to the Book Wagon Server!" });
    });
    app.get("/api/health-check", healthCheck);

    app.use("/api/users", usersRouter);
    app.use(`${API_PREFIX}/books`, booksRouter);
    app.use("/api/orders", ordersRouter);
    app.use("/api/checkout", checkoutRouter);
    app.use("/api/payments", paymentsRouter);
    app.use("/api/favorites", favoritesRouter);
    app.use("/api/comments", commentsRouter);
    app.use("/api/dashboard", dashboardRouter);
    app.use(`${API_PREFIX}/categories`, categoryRouter);
    app.use(`${API_PREFIX}/sub-categories`, subCategoryRouter);
    app.use(`${API_PREFIX}/book-formats`, bookFormatRouter);

    app.use((_req: Request, res: Response<TErrorResponse>) => {
      return res
        .status(404)
        .send({ success: false, message: "Route not found!" });
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
