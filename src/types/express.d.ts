import type { TUser } from "@/user/interface/user.ts";

declare global {
  namespace Express {
    interface Request {
      user: Pick<TUser, "_id" | "name" | "email" | "role">;
    }
  }
}

export {};
