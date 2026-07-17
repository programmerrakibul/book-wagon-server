import type { TUserDocument } from "@/user/interface/user.js";
import { User } from "@/user/model/user.js";
import {
  toggleRoleSchema,
  userQuerySchema,
  userSchema,
} from "@/user/validation/user.js";
import { getPaginatedData } from "@/utils/getPaginatedData.js";
import { parseOrThrow } from "@/utils/utils.js";
import { NotFoundError } from "http-errors-enhanced";
import type { PaginateOptions, PaginateResult } from "mongoose";

const getUsers = async (queryPayload: unknown) => {
  const sort: Record<string, 1 | -1> = {
    createdAt: -1,
  };

  const {
    limit = 10,
    page = 1,
    search,
    sortBy,
    sortOrder,
  } = parseOrThrow(userQuerySchema, queryPayload);

  const query: Record<string, unknown> = {};

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

  const result: PaginateResult<TUserDocument> = await User.paginate(query, opt);

  return getPaginatedData(result);
};

const getUserRole = async (email: string) => {
  const role = await User.getRole(email);

  return { role };
};

const upsertUser = async (payload: unknown) => {
  const { email, ...userData } = parseOrThrow(userSchema, payload);

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    await User.findByIdAndUpdate(existingUser._id, {
      lastLoggedIn: Date.now(),
    });

    return { isNewUser: false };
  }

  await User.create({ email, ...userData });

  return { isNewUser: true };
};

const updateUserRole = async (payload: unknown) => {
  const { role, email } = parseOrThrow(toggleRoleSchema, payload);

  const user = await User.findOne({ email });

  if (!user) {
    throw new NotFoundError("User not found!");
  }

  await User.toggleRole(email, role);
};

const services = {
  getUsers,
  getUserRole,
  upsertUser,
  updateUserRole,
};

export default services;
