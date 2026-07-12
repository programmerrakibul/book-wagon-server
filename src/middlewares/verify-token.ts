import { envConfig } from "@/config/env.js";
import type { TUserDocument } from "@/user/interface/user.js";
import { User } from "@/user/model/user.js";
import type { NextFunction, Request, Response } from "express";
import admin, { type ServiceAccount } from "firebase-admin";
import { UnauthorizedError } from "http-errors-enhanced";

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

    console.log(`Validating token...`);

    if (!token) throw new UnauthorizedError("Unauthorized access!");

    const { email } = await admin.auth().verifyIdToken(token);

    console.log(`Verifying email...`);

    if (!email) throw new UnauthorizedError("Unauthorized access!");

    const dbUser: TUserDocument | null = await User.findOne({ email });

    console.log(`Verifying user...`);

    if (!dbUser) throw new UnauthorizedError("Unauthorized access!");

    req.user = {
      _id: dbUser._id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
    };

    console.log("User verified!");

    next();
  } catch (err: unknown) {
    throw new UnauthorizedError(err as Error);
  }
};
