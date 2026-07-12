import type { NextFunction, Request, Response } from "express";
import { ForbiddenError } from "http-errors-enhanced";
import { User } from "../models/user.model.js";
import type { TUserDocument, TUserRole } from "../types/user.interface.js";

export const authorize = (...roles: TUserRole[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const { _id } = req.user;

      const user: TUserDocument | null = await User.findById(_id);

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
