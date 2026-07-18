import type { TUser } from "@/user/interface/user.js";
import User from "@/user/model/user.js";
import type { TUserRole } from "@/user/validation/user.js";
import type { NextFunction, Request, Response } from "express";
import { ForbiddenError } from "http-errors-enhanced";

export const authorize = (...roles: TUserRole[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const { _id } = req.user;

      const user: TUser | null = await User.findById(_id);

      roles = roles.map((role) => role?.toLowerCase() as TUserRole);

      if (!roles.includes(user?.role as TUserRole)) {
        throw new ForbiddenError("Forbidden access!");
      }

      next();
    } catch {
      throw new ForbiddenError("Forbidden access!");
    }
  };
};
