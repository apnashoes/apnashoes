import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    customer: {
      name: String,
      email: String,
      phone: String,
      address: String,
      city: String,
      postalCode: String,
      country: { type: String, default: "Pakistan" },
    },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        title: String,
        price: Number,
        quantity: Number,
        image: String,
      },
    ],
    subtotal: Number,
    shipping: { type: Number, default: 0 },
    total: Number,
    discountCode: String,

    // 🔹 Payment
    paymentMethod: {
      type: String,
      enum: ["payfast", "easypaisa", "jazzcash", "cod"],
      default: "cod",
    },
    transactionId: String,
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    // 🔹 Order lifecycle
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "completed", "cancelled"],
      default: "pending",
    },

    // 🔹 Delivery info
    deliveryMethod: {
      type: String,
      enum: ["standard", "express"],
      default: "standard",
    },
    trackingNumber: String,
    courier: String,

    // 🔹 Notes
    notes: String,
    adminNote: String,
  },
  { timestamps: true }
);

// Indexing for faster admin queries
OrderSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
