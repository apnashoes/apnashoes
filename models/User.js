// import mongoose from "mongoose";

// const UserSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, unique: true },
//   phone: { type: String, unique: true }, // for OTP login
//   password: { type: String }, // hashed if using password login
//   role: { type: String, enum: ["customer", "admin"], default: "customer" },
//   createdAt: { type: Date, default: Date.now },
// });

// export default mongoose.models.User || mongoose.model("User", UserSchema);

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: String,
    image: String,

    // Extra fields from your form
    phone: String,
    address: String,

    // Optional: role system
    role: {
      type: String,
      default: "user",
    },

    wishlist: [
      {
        productId: String,
        name: String,
        price: Number,
        image: String,
      },
    ],
  },

  { timestamps: true },
);

// Prevent model overwrite error in Next.js
export default mongoose.models.User || mongoose.model("User", UserSchema);
