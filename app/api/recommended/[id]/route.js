import dbConnect from "@/lib/db";
import Product from "@/models/Product";

export async function GET(req, { params }) {
  try {
    await dbConnect();

    // Access id directly
    const id = await params.id;

    // Validate ObjectId length
    if (!id || id.length !== 24) {
      return Response.json({ recommended: [] });
    }

    const product = await Product.findById(id);

    if (!product) {
      return Response.json({ recommended: [] });
    }

    // Find recommended products in same category, exclude current
    const recommended = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    }).limit(8);

    return Response.json({ recommended });
  } catch (error) {
    console.error("Recommended API Error:", error);
    return Response.json({ recommended: [] }, { status: 500 });
  }
}
