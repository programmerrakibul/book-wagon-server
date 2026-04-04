import type { TUserDocument } from "./user.interface.ts";

declare global {
  namespace Express {
    interface Request {
      user: Pick<TUserDocument, "_id" | "name" | "email" | "role">;
    }
  }
}

export {};
