import connectDB from "@/lib/db";
import Product from "@/models/Product";

export async function GET(req, { params }) {
  await connectDB();
  const { slug } = params;

  try {
    const product = await Product.findOne({ slug });
    if (!product) {
      return new Response(JSON.stringify({ error: "Product not found" }), { status: 404 });
    }
    return new Response(JSON.stringify(product), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
