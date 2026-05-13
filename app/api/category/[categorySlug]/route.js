import dbConnect from "@/lib/db";
import Product from "@/models/Product";

export async function GET(req, context) {
  try {
    await dbConnect();

    // ✅ params is now async
    const { categorySlug } = await context.params;

    const products = await Product.find({ categorySlug });

    return Response.json({ products });
  } catch (err) {
    console.error("Error fetching products:", err);
    return Response.json({ message: "Error fetching products" }, { status: 500 });
  }
}
