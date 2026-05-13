import connectDB from "@/lib/db";
import Product from "@/models/Product";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (slug) {
      // ✅ single product
      const product = await Product.findOne({ slug });
      if (!product) {
        return new Response(
          JSON.stringify({ success: false, message: "Product not found" }),
          { status: 404 }
        );
      }
      return new Response(JSON.stringify({ success: true, product }), {
        status: 200,
      });
    }

    // ✅ all products
    const products = await Product.find({});
    return new Response(JSON.stringify({ success: true, products }), {
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
}
