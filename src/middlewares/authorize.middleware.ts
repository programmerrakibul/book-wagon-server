import { User } from "@/models/user.model.js";
import { ForbiddenError } from "@/utils/utils.js";

import type { Request, Response, NextFunction } from "express";
import type { TUserDocument, TUserRole } from "@/types/user.interface.js";

export const authorize = (...roles: TUserRole[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const { _id } = req.user;

      const user: TUserDocument | null = await User.findById(_id);

      roles = roles.map((role) => role?.toLowerCase() as TUserRole);

      if (!roles.includes(user?.role as TUserRole)) {
        throw new ForbiddenError();
      }

      next();
    } catch {
      throw new ForbiddenError();
    }
  };
};
