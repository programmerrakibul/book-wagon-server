const { paymentsCollection, ordersCollection } = require("../db");

const stripe = require("stripe")(process.env.PAYMENT_GATEWAY_SECRET_KEY);

const createCheckout = async (req, res) => {
  const paymentInfo = req.body;

  if (!paymentInfo || Object.keys(paymentInfo).length === 0) {
    return res.status(400).send({
      message: "Payment info required",
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
      success_url: `${process.env.SITE_DOMAIN}/dashboard/my-orders?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_DOMAIN}/dashboard/my-orders`,
    });

    res.send({ url: session.url });
  } catch (err) {
    console.log(err);

    res.status(500).send({ message: "Internal server error" });
  }
};

const retrieveCheckout = async (req, res) => {
  const { session_id } = req.params;

  if (session_id.trim() === "") {
    return res.status(400).send({ message: "Invalid session ID" });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const {
      payment_status: paymentStatus,
      payment_intent: transactionId,
      metadata: { bookId, orderID },
      customer_email,
    } = session;

    if (paymentStatus === "paid") {
      const isExist = await paymentsCollection.findOne({ orderID });

      if (!!isExist) {
        return res.send({
          orderID,
          transactionId,
        });
      } else {
        const paymentInfo = {
          orderID,
          transactionId,
          createdAt: new Date().toISOString(),
          bookId,
          customer_email,
          paymentStatus,
        };

        await ordersCollection.updateOne(
          { orderID },
          {
            $set: { paymentStatus },
          }
        );
        await paymentsCollection.insertOne(paymentInfo);

        return res.send({
          orderID,
          transactionId,
        });
      }
    }

    console.log(session);

    res.status(400).send({ message: "Payment failed" });
  } catch (err) {
    console.log(err);

    res.status(500).send({
      message: "Internal server error",
    });
  }
};

module.exports = { createCheckout, retrieveCheckout };
