const { ObjectId } = require("mongodb");
const { ordersCollection } = require("../config/db.js");
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
  } catch {
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const isOrdered = async (req, res) => {
  const { bookId, customerEmail } = req.params;

  if (!bookId || !customerEmail) {
    return res
      .status(400)
      .send({ message: "Customer email and book id required!" });
  }
  const query = { bookId, customerEmail };

  try {
    const result = await ordersCollection.findOne(query);

    const isOrdered =
      result?.status === ("pending" || "shipped" || "delivered") || false;

    res.send(isOrdered);
  } catch {
    res.status(500).send({
      message: "Internal server error",
    });
  }
};

const getLibrarianOrders = async (req, res) => {
  const { email } = req.params;

  if (!email.trim()) {
    return res.status(400).send({ message: "Email is required" });
  }

  const pipeline = [
    {
      $match: { librarianEmail: email },
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
  } catch {
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

const updateOrder = async (req, res) => {
  const updatedData = req.body;

  if (Object.keys(updatedData || {}).length === 0) {
    return res
      .status(400)
      .send({ success: false, message: "No data provided for update" });
  }

  const query = { _id: new ObjectId(req.params.id) };

  try {
    const result = await ordersCollection.updateOne(query, {
      $set: updatedData,
    });

    res.send({
      success: true,
      message: "Order data updated successfully",
      ...result,
    });
  } catch (err) {
    console.log(err);

    res
      .status(500)
      .send({
        success: false,
        message: err.message || "Internal server error",
      });
  }
};

module.exports = {
  postOrder,
  getCustomerOrders,
  updateOrder,
  getLibrarianOrders,
  isOrdered,
};
