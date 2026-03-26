import { Payment } from "../models/Payment.js";

export const getInvoices = async (req, res, next) => {
  const email = req.params.email?.trim()?.toLowerCase();

  if (!email) {
    return res
      .status(400)
      .send({ success: false, message: "Email is required" });
  }

  const pipeline = [
    {
      $match: {
        customer_email: email,
      },
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
        as: "book",
      },
    },
    {
      $unwind: "$book",
    },
    {
      $addFields: {
        bookName: "$book.bookName",
      },
    },
    {
      $project: {
        book: 0,
        bookId: 0,
        objectId: 0,
        customer_email: 0,
        librarianEmail: 0,
      },
    },
  ];

  try {
    const result = await Payment.aggregate(pipeline);

    res.send(result);
  } catch (err) {
    next(err);
  }
};
