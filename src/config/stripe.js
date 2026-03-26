import Stripe from "stripe";
import { envConfig } from "./envConfig.js";

const stripeSecretKey = envConfig.PAYMENT_GATEWAY_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error(
    "PAYMENT_GATEWAY_SECRET_KEY is not defined in environment variables",
  );
}

export const stripe = new Stripe(stripeSecretKey);
