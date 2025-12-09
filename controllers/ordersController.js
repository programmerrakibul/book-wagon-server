const { ordersCollection } = require("../db.js");
const { generateOrderID } = require("../utilities/generateOrderID.js");

const getCustomerOrders = async (req, res) => {
  const { email } = req.params;

  if (!email.trim()) {
    return res.status(400).send({ message: "Email is required" });
  }

  const pipeline = [
    {
      $match: { customerEmail: email },
    },
    {
      $addFields: {
        objectId: { $toObjectId: "$bookId" },
      },
    },
    {
      $lookup: {
        from: "books",
        localField: "objectId",
        foreignField: "_id",
        as: "orderedBook",
      },
    },
    {
      $unwind: "$orderedBook",
    },
    {
      $project: {
        objectId: 0,
        "orderedBook._id": 0,
        "orderedBook.updatedAt": 0,
        "orderedBook.status": 0,
        "orderedBook.pageCount": 0,
      },
    },
  ];

  try {
    const result = await ordersCollection.aggregate(pipeline).toArray();

    res.send({
      success: true,
      message: "Orders data retrieved successfully",
      orders: result,
    });
  } catch (err) {
    console.log(err);

    res.status(500).send({ message: "Internal Server Error" });
  }
};

const postOrder = async (req, res) => {
  const orderData = req.body;
  const today = new Date().toISOString();
  const orderID = generateOrderID();

  if (typeof orderData !== "object") {
    return res.status(400).send({ message: "Order data is required" });
  }

  orderData.orderID = orderID;
  orderData.createdAt = today;
  orderData.status = "pending";
  orderData.paymentStatus = "unpaid";

  try {
    const result = await ordersCollection.insertOne(orderData);
    res.status(201).send({
      success: true,
      message: "Order data posted successfully",
      ...result,
    });
  } catch {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

module.exports = { postOrder, getCustomerOrders };
