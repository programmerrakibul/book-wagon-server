import services from "@/user/service/user.js";
import { sendSuccessResponse } from "@/utils/sendResponse.js";
import type { Request, Response } from "express";
import status from "http-status";

const getUsers = async (req: Request, res: Response) => {
  const result = await services.getUsers(req.query);

  sendSuccessResponse(res, status.OK, {
    message: "Users data retrieved successfully!",
    ...result,
  });
};

const getUserProfile = async (req: Request, res: Response) => {
  const result = await services.getUserProfile(req.user._id);

  sendSuccessResponse(res, status.OK, {
    message: "User data retrieved successfully!",
    data: result,
  });
};

const getUserRole = async (req: Request<{ email: string }>, res: Response) => {
  const result = await services.getUserRole(req.params.email);

  sendSuccessResponse(res, status.OK, {
    message: "User role retrieved successfully!",
    data: result,
  });
};

const postUser = async (req: Request, res: Response) => {
  const result = await services.upsertUser(req.body);

  const statusCode = result.isNewUser ? status.CREATED : status.OK;
  const message = result.isNewUser
    ? "User created successfully!"
    : "User with this email already exists!";

  sendSuccessResponse(res, statusCode, { message });
};

const updateUserProfile = async (req: Request, res: Response) => {
  await services.updateUserProfile(req.user._id, req.body);

  sendSuccessResponse(res, status.OK, {
    message: "User data updated successfully!",
  });
};

const updateUserRole = async (req: Request<{ id: string }>, res: Response) => {
  await services.updateUserRole(req.params.id, req.body);

  sendSuccessResponse(res, status.OK, {
    message: "User role updated successfully!",
  });
};

const controllers = {
  getUsers,
  getUserProfile,
  getUserRole,
  postUser,
  updateUserProfile,
  updateUserRole,
};

export default controllers;
