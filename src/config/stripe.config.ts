import Stripe from "stripe";
import { envConfig } from "./env.config.js";

export const stripe = new Stripe(envConfig.PAYMENT_GATEWAY_SECRET_KEY);
