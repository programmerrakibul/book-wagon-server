const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    orderID: {
      type: String,
      required: [true, "Order ID is required"],
      unique: true,
      trim: true,
    },
    transactionId: {
      type: String,
      required: [true, "Transaction ID is required"],
      unique: true,
      trim: true,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Book ID is required"],
      ref: "Book",
      validate: {
        validator: function (v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: "Invalid Book ID format",
      },
    },
    customer_email: {
      type: String,
      required: [true, "Customer email is required"],
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Please provide a valid email address",
      },
    },
    paymentStatus: {
      type: String,
      required: [true, "Payment status is required"],
      trim: true,
      lowercase: true,
      enum: {
        values: ["paid", "unpaid", "pending", "failed", "refunded"],
        message: "{VALUE} is not a valid payment status",
      },
      default: "pending",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      max: [999999.99, "Price is too high"],
      set: (v) => parseFloat(v).toFixed(2),
      get: (v) => parseFloat(v).toFixed(2),
    },
  },
  {
    timestamps: true,
  },
);

paymentSchema.pre("save", async function () {
  this.updatedAt = new Date().toISOString();
});

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = { Payment };
