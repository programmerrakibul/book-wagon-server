import admin, { type ServiceAccount } from "firebase-admin";
import type { Request, Response, NextFunction } from "express";
import { envConfig } from "@/config/env.config.js";
import { UnauthorizedError } from "@/utils/utils.js";
import type { TUserDocument } from "@/types/user.interface.js";
import { User } from "@/models/user.model.js";

const serviceKey = envConfig.FIREBASE_SERVICE_KEY;
const decoded = Buffer.from(serviceKey, "base64").toString("utf8");
const serviceAccount: ServiceAccount = JSON.parse(decoded);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const verifyTokenID = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.substring(7);

    if (!token) throw new UnauthorizedError();

    const { email } = await admin.auth().verifyIdToken(token);

    if (!email) throw new UnauthorizedError();

    const dbUser: TUserDocument | null = await User.findOne({ email });

    if (!dbUser) throw new UnauthorizedError();

    req.user = {
      _id: dbUser._id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
    };

    next();
  } catch {
    throw new UnauthorizedError();
  }
};
