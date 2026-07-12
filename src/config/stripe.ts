import { envConfig } from "@/config/env.js";
import Stripe from "stripe";

export const stripe = new Stripe(envConfig.PAYMENT_GATEWAY_SECRET_KEY);
