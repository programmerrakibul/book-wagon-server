import services from "@/dashboard/service/dashboard.js";
import { sendSuccessResponse } from "@/utils/sendResponse.js";
import type { Request, Response } from "express";
import status from "http-status";

const getUserDashboardData = async (req: Request, res: Response) => {
  const result = await services.getUserDashboardData(req.user._id);

  sendSuccessResponse(res, status.OK, {
    message: "Dashboard data retrieved successfully!",
    data: result,
  });
};

const getLibrarianDashboardData = async (req: Request, res: Response) => {
  const result = await services.getLibrarianDashboardData(req.user._id);

  sendSuccessResponse(res, status.OK, {
    message: "Dashboard data retrieved successfully!",
    data: result,
  });
};

const getAdminDashboardData = async (_req: Request, res: Response) => {
  const result = await services.getAdminDashboardData();

  sendSuccessResponse(res, status.OK, {
    message: "Dashboard data retrieved successfully!",
    data: result,
  });
};

const controllers = {
  getUserDashboardData,
  getLibrarianDashboardData,
  getAdminDashboardData,
};

export default controllers;
