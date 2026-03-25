const { envConfig } = require("../config/env.js");
const { stripe } = require("../config/stripe.js");
const { Order } = require("../models/Order.js");
const { Payment } = require("../models/Payment.js");

const clientUrl = envConfig.CLIENT_URL;

const createCheckout = async (req, res) => {
  const paymentInfo = req.body;

  if (Object.keys(paymentInfo || {}).length === 0) {
    return res.status(400).send({
      success: false,
      message: "Payment info is required",
    });
  }

  const { customerEmail, price, bookId, description, bookName, orderID } =
    paymentInfo;

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            unit_amount: Number(price) * 100,
            currency: "usd",
            product_data: {
              name: bookName,
              description,
            },
          },
          quantity: 1,
        },
      ],
      customer_email: customerEmail,
      metadata: {
        bookId,
        orderID,
      },
      mode: "payment",
      success_url: `${clientUrl}/dashboard/my-orders?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/dashboard/my-orders`,
    });

    res.send({ success: true, url: session.url });
  } catch (err) {
    console.log(err);

    res.status(500).send({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

const retrieveCheckout = async (req, res) => {
  const session_id = req.params.session_id?.trim();

  if (!session_id) {
    return res
      .status(400)
      .send({ success: false, message: "Invalid session ID" });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const {
      payment_status: paymentStatus,
      payment_intent: transactionId,
      metadata: { bookId, orderID },
      customer_email,
      amount_total,
    } = session;

    if (paymentStatus === "paid") {
      const isExist = await Payment.findOne({ orderID });

      if (!!isExist) {
        return res.send({ success: true, orderID, transactionId });
      } else {
        const paymentInfo = {
          orderID,
          transactionId,
          bookId,
          customer_email,
          paymentStatus,
          price: amount_total / 100,
        };

        await Order.findOneAndUpdate(
          { orderID },
          {
            paymentStatus,
          },
          {
            new: true,
          },
        );
        await Payment.create(paymentInfo);

        return res.send({ success: true, orderID, transactionId });
      }
    }

    res.status(400).send({ success: false, message: "Payment failed" });
  } catch (err) {
    console.log(err);

    res.status(500).send({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

module.exports = { createCheckout, retrieveCheckout };
