const { paymentsCollection } = require("../db");

const getInvoices = async (req, res) => {
  const { email } = req.params;

  if (email.trim() === "") {
    return res.status(400).send({ message: "Email is required" });
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
      },
    },
  ];

  try {
    const result = await paymentsCollection.aggregate(pipeline).toArray();

    res.send(result);
  } catch (err) {
    console.log(err);

    res.status(500).send({ message: "Internal server error" });
  }
};

module.exports = { getInvoices };
