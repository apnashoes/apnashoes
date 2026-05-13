import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await dbConnect();

    const url = new URL(req.url);
    let search = url.searchParams.get("q") || "";
    search = search.trim();

    if (!search) {
      const allProducts = await Product.find().limit(20);
      return NextResponse.json(allProducts);
    }

    const regex = new RegExp(search, "i");

    const products = await Product.find({
      title: { $regex: regex },
    }).limit(50);

    console.log("Search query:", search);
    console.log("Products found:", products);

    return NextResponse.json(products);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
