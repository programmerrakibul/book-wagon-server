const Stripe = require("stripe");
const { envConfig } = require("./env");

const stripeSecretKey = envConfig.PAYMENT_GATEWAY_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error(
    "PAYMENT_GATEWAY_SECRET_KEY is not defined in environment variables",
  );
}

const stripe = new Stripe(stripeSecretKey);

module.exports = { stripe };
