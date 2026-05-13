// import { v2 as cloudinary } from "cloudinary";
// import { NextResponse } from "next/server";
// import dbConnect from "@/lib/db";
// import Product from "@/models/Product";

// cloudinary.config({
//   cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const uploadMiddleware = upload.array("gallery"); // same key!

// export async function POST(req) {
//   await dbConnect();

//   try {
//     const formData = await req.formData();

//     const files = formData.getAll("images");
//     console.log("FILES RECEIVED:", files);

//     if (!files || files.length === 0) {
//       return NextResponse.json(
//         { success: false, error: "Images are required" },
//         { status: 400 }
//       );
//     }

//     const uploadToCloudinary = async (file) => {
//       const buffer = Buffer.from(await file.arrayBuffer());

//       return await new Promise((resolve, reject) => {
//         cloudinary.uploader
//           .upload_stream({ folder: "products" }, (err, result) => {
//             if (err) reject(err);
//             else resolve({
//               url: result.secure_url,
//               public_id: result.public_id,
//             });
//           })
//           .end(buffer);
//       });
//     };

//     const uploadedImages = await Promise.all(
//       files.map((file) => uploadToCloudinary(file))
//     );

//     const slug =
//       formData.get("slug") ||
//       formData.get("title").toLowerCase().replace(/\s+/g, "-");

//     const product = new Product({
//       title: formData.get("title"),
//       slug,
//       price: Number(formData.get("price")),
//       oldPrice: Number(formData.get("oldPrice")) || 0,
//       category: formData.get("category"),
//       brand: formData.get("brand"),
//       gender: formData.get("gender"),
//       weave: formData.get("weave"), // ✅ FIXED
//       description: formData.get("description"),
//       variants: JSON.parse(formData.get("variants") || "[]"),
//       images: {
//         main: uploadedImages[0],
//         gallery: uploadedImages.slice(1),
//       },
//     });

//     await product.save();

//     return NextResponse.json({ success: true }, { status: 201 });
//   } catch (error) {
//     console.error("SERVER ERROR:", error);

//     return NextResponse.json(
//       { success: false, error: error.message },
//       { status: 500 }
//     );
//   }
// }

import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";

// ✅ Cloudinary config
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  await dbConnect();

  try {
    const formData = await req.formData();

    // ✅ FIX: use SAME key as frontend ("gallery")
    const files = formData.getAll("gallery");

    console.log("FILES RECEIVED:", files.length);

    // ✅ filter valid files
    const validFiles = files.filter(
      (file) => file && file.size > 0
    );

    if (validFiles.length === 0) {
      return NextResponse.json(
        { success: false, error: "Images are required" },
        { status: 400 }
      );
    }

    // ✅ Upload function
    const uploadToCloudinary = async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer());

      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "products" },
          (err, result) => {
            if (err) return reject(err);

            resolve({
              url: result.secure_url,
              public_id: result.public_id,
            });
          }
        );

        stream.end(buffer);
      });
    };

    // ✅ Upload ALL images
    const uploadedImages = await Promise.all(
      validFiles.map((file) => uploadToCloudinary(file))
    );

    // ✅ Slug generate
    const slug =
      formData.get("slug") ||
      formData.get("title").toLowerCase().replace(/\s+/g, "-");

    // ✅ Create product
    const product = new Product({
      title: formData.get("title"),
      slug,
      price: Number(formData.get("price")),
      oldPrice: Number(formData.get("oldPrice")) || 0,
      category: formData.get("category"),
      brand: formData.get("brand"),
      gender: formData.get("gender"),
      weave: formData.get("weave"),
      description: formData.get("description"),
      variants: JSON.parse(formData.get("variants") || "[]"),

      images: {
        main: uploadedImages[0] || null, // first image
        gallery: uploadedImages.slice(1), // rest images
      },
    });

    await product.save();

    return NextResponse.json(
      { success: true, product },
      { status: 201 }
    );
  } catch (error) {
    console.error("SERVER ERROR:", error);

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}