import type { NextFunction, Request, Response } from "express";
import type { PaginateOptions, PaginateResult } from "mongoose";
import { User } from "../models/user.model.js";
import type {
  TPaginatedResponse,
  TSuccessResponse,
} from "../types/index.interface.js";
import type {
  TCreateUser,
  TToggleRole,
  TUserDocument,
  TUserQuery,
} from "../types/user.interface.js";
import { userQuerySchema } from "../validations/user.validator.js";

export const getUsers = async (
  req: Request<{}, {}, {}, TUserQuery>,
  res: Response<TPaginatedResponse<TUserDocument>>,
  next: NextFunction,
) => {
  try {
    const query: Record<string, unknown> = {};
    const sort: Record<string, 1 | -1> = {
      createdAt: -1,
    };

    const {
      limit = 10,
      page = 1,
      search,
      sortBy,
      sortOrder,
    } = userQuerySchema.parse(req.query);

    if (search) {
      query["$or"] = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (sortBy && sortOrder) {
      const order = sortOrder === "desc" ? -1 : 1;
      sort[sortBy] = order;

      delete sort.createdAt;
    }

    const opt: PaginateOptions = {
      sort,
      limit,
      page,
      select: "-__v",
    };

    const { docs, ...data }: PaginateResult<TUserDocument> =
      await User.paginate(query, opt);

    res.send({
      success: true,
      message: "Users data retrieved successfully",
      data: docs,
      pagination: {
        totalDocs: data.totalDocs,
        hasPrevPage: data.hasPrevPage,
        hasNextPage: data.hasNextPage,
        totalPages: data.totalPages,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getUserRole = async (
  req: Request,
  res: Response<TSuccessResponse<Pick<TUserDocument, "role">>>,
  next: NextFunction,
) => {
  try {
    const { email } = req.user;

    const role = await User.getRole(email);

    res.send({
      success: true,
      message: "User role retrieved successfully!",
      data: { role },
    });
  } catch (err) {
    next(err);
  }
};

export const postUser = async (
  req: Request<{}, {}, TCreateUser>,
  res: Response<TSuccessResponse>,
  next: NextFunction,
) => {
  try {
    const { email, ...userData } = req.body;

    const user: TUserDocument | null = await User.findOne({
      email,
    });

    if (user) {
      await User.findByIdAndUpdate(user._id, { lastLoggedIn: Date.now() });

      return res.send({
        success: true,
        message: "User with this email already exists!",
      });
    }

    await User.create({ email, ...userData });

    res.status(201).send({
      success: true,
      message: "User data posted successfully!",
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (
  req: Request<{}, {}, TToggleRole>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { role, email } = req.body;

    await User.toggleRole(email, role);

    res.send({
      success: true,
      message: "User role updated successfully!",
    });
  } catch (err) {
    next(err);
  }
};
