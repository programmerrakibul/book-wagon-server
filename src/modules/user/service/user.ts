import type { TUser } from "@/user/interface/user.js";
import User from "@/user/model/user.js";
import {
  createUserSchema,
  updateUserRoleSchema,
  updateUserSchema,
  userQuerySchema,
} from "@/user/validation/user.js";
import { getPaginatedData } from "@/utils/getPaginatedData.js";
import { parseOrThrow } from "@/utils/utils.js";
import { NotFoundError } from "http-errors-enhanced";
import type { PaginateOptions, PaginateResult, Types } from "mongoose";

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
      { role: { $regex: search, $options: "i" } },
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
    select: "-books -orders",
  };

  const result: PaginateResult<TUser> = await User.paginate(query, opt);

  return getPaginatedData(result);
};

const getUserProfile = async (id: Types.ObjectId) => {
  const user = await User.findById(id).lean().exec();

  if (!user) {
    throw new NotFoundError("This user does not exist!");
  }

  return user;
};

const getUserRole = async (id: Types.ObjectId) => {
  const user = await User.findById(id).select("role").lean().exec();

  if (!user) {
    throw new NotFoundError("This user does not exist!");
  }

  return { role: user.role };
};

const upsertUser = async (payload: unknown) => {
  const { email, ...userData } = parseOrThrow(createUserSchema, payload);

  const user = await User.findOne({ email }).select("lastLoggedIn");

  if (user) {
    user.lastLoggedIn = new Date();
    await user.save();

    return { isNewUser: false };
  }

  await User.create({ email, ...userData });

  return { isNewUser: true };
};

const updateUserProfile = async (id: Types.ObjectId, payload: unknown) => {
  const { name, photoUrl } = parseOrThrow(updateUserSchema, payload);

  const user = await User.findById(id).select("name photoUrl");

  if (!user) {
    throw new NotFoundError("User not found!");
  }

  user.name = name || user.name;
  user.photoUrl = photoUrl || user.photoUrl;
  await user.save();
};

const updateUserRole = async (userId: string, payload: unknown) => {
  const { role } = parseOrThrow(updateUserRoleSchema, payload);

  const user = await User.findById(userId).select("role").lean().exec();

  if (!user) {
    throw new NotFoundError("User not found!");
  }

  user.role = role;
  await user.save();
};

const services = {
  getUsers,
  getUserProfile,
  getUserRole,
  upsertUser,
  updateUserProfile,
  updateUserRole,
};

export default services;
