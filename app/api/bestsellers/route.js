import { NextResponse } from "next/server";
import connectDB from "@/lib/db"; // your DB connection
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectDB();

    // 🔥 Get top selling products
    const products = await Product.find({ isTopSelling: true })
      .sort({ soldCount: -1 }) // highest sold first
      .limit(6);

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("BestSeller API Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch best sellers" },
      { status: 500 }
    );
  }
}