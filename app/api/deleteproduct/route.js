
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function getPublicId(url) {
  try {
    // Example: https://res.cloudinary.com/demo/image/upload/v1234567/abcxyz.jpg
    const parts = url.split("/");
    const fileWithExt = parts[parts.length - 1]; // abcxyz.jpg
    const folder = parts[parts.length - 2];      // upload folder name
    const publicId = `${folder}/${fileWithExt.split(".")[0]}`;
    return publicId;
  } catch {
    return null;
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const { id } = await req.json();

    // 1. Find product
    const product = await Product.findById(id);
    if (!product) {
      return new Response(JSON.stringify({ success: false, message: "Product not found" }), {
        status: 404,
      });
    }

     // 🔥 1. Delete MAIN image
    if (product.images?.main?.public_id) {
      const result = await cloudinary.uploader.destroy(
        product.images.main.public_id
      );
      console.log("Main image deleted:", result);
    }

    // 🔥 2. Delete ALL GALLERY images
    if (product.images?.gallery?.length > 0) {
      for (const img of product.images.gallery) {
        if (img.public_id) {
          const result = await cloudinary.uploader.destroy(img.public_id);
          console.log("Gallery image deleted:", result);
        }
      }
    }

    // 3. Delete product from DB
    await Product.findByIdAndDelete(id);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("❌ Delete product error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
