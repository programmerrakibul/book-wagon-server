const Stripe = require("stripe");

const stripeSecretKey = process.env.PAYMENT_GATEWAY_SECRET_KEY;

if (!stripeSecretKey?.trim()) {
  throw new Error(
    "PAYMENT_GATEWAY_SECRET_KEY is not defined in environment variables",
  );
}

const stripe = new Stripe(stripeSecretKey);

module.exports = { stripe };
