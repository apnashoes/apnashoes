// import mongoose from "mongoose";

// const ImageSchema = new mongoose.Schema({
//   url: String,
//   public_id: String,
// });

// const ProductSchema = new mongoose.Schema(
//   {
//     title: String,
//     slug: String,
//     price: Number,
//     oldPrice: Number,
//     category: String,
//     brand: String,
//     gender: String,
//     weave: String,
//     description: String,

//     // ✅ Variants = Colors → Sizes[]
//     variants: [
//       {
//         color: {
//           name: { type: String, required: true },
//           code: { type: String }, // ✅ keep consistent with frontend
//         },
//         sizes: [
//           {
//             size: { type: Number, required: true }, // ✅ FIXED
//             stock: { type: Number, required: true, default: 0 },
//           },
//         ],
//       },
//     ],

//     images: {
//       main: {
//         url: String,
//         public_id: String,
//       },
//       gallery: [
//         {
//           url: String,
//           public_id: String,
//         },
//       ],
//     },

//     // 🆕 Add this
//     soldCount: { type: Number, default: 0 }, // track how many sold
//     isTopSelling: { type: Boolean, default: false }, // mark manually if needed
//   },

//   { timestamps: true },
// );

// export default mongoose.models.Product ||
//   mongoose.model("Product", ProductSchema);


import mongoose from "mongoose";

/* 🔹 Image Schema */
const ImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    public_id: { type: String },
  },
  { _id: false }
);

/* 🔹 Size Schema (UPDATED) */
const SizeSchema = new mongoose.Schema(
  {
    size: {
      type: Number,
      required: true,
      min: 1, // adjust if needed (e.g. 30 for shoes)
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

/* 🔹 Variant Schema */
const VariantSchema = new mongoose.Schema(
  {
    color: {
      name: { type: String, required: true, trim: true },
      code: { type: String, default: "#000000" },
    },

    sizes: {
      type: [SizeSchema],

      validate: [
        {
          validator: function (sizes) {
            // ❌ prevent duplicate sizes like 40,40
            const uniqueSizes = new Set(sizes.map((s) => s.size));
            return uniqueSizes.size === sizes.length;
          },
          message: "Duplicate sizes are not allowed in a variant.",
        },
      ],
    },
  },
  { _id: false }
);

/* 🔹 Product Schema */
const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },

    price: { type: Number, required: true },
    oldPrice: { type: Number },

    category: { type: String, required: true },
    categorySlug: { type: String }, // ✅ stored in DB
    brand: { type: String },
    gender: { type: String },
    weave: { type: String },

    description: { type: String },

    /* ✅ Variants */
    variants: [VariantSchema],

    /* 🔹 Images */
    images: {
      main: ImageSchema,
      gallery: [ImageSchema],
    },

    /* 🔹 Sales */
    soldCount: { type: Number, default: 0, min: 0 }, // track how many sold
    isTopSelling: { type: Boolean, default: false }, // mark manually if needed
  },
  { timestamps: true }
);

/* 🔥 INDEXES (IMPORTANT FOR PERFORMANCE) */
// ProductSchema.index({ slug: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ "variants.color.name": 1 });

// ✅ Pre-save hook (runs before saving product)
ProductSchema.pre("save", function (next) {
  if (this.category) {
    this.categorySlug = this.category
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/\s+/g, "-")
      .trim();
  }
  next();
});

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);