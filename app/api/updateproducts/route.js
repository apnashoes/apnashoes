import connectDB from "@/lib/db";
import Product from "@/models/Product";

export async function POST(req) {
  try {
    await connectDB();
    const { id, updateData } = await req.json();

    const updated = await Product.findByIdAndUpdate(id, updateData, { new: true });

    return new Response(JSON.stringify({ success: true, product: updated }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
