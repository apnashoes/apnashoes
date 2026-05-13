import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    const { customer, items, total } = body;

    // ✅ Validate data
    if (!customer || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing required order data" },
        { status: 400 }
      );
    }

    // ✅ Create order (COD only)
    const newOrder = await Order.create({
      customer: {
        name: `${customer.firstName} ${customer.lastName}`.trim(),
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        postalCode: customer.postalCode,
        country: customer.country || "Pakistan",
      },
      items: items.map((item) => ({
        productId: item._id,
        title: item.title,
        price: item.price,
        quantity: item.qty,
        image:
          item.images?.mainImage?.url ||
          item.image ||
          "/placeholder.png",
      })),
      subtotal: total - 99, // optional, you can remove this
      shipping: 99,
      total,
      paymentMethod: "cod",
      paymentStatus: "pending",
      status: "pending",
    });

    return NextResponse.json({ success: true, order: newOrder });
  } catch (error) {
    console.error("Order Save Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();
    const orders = await Order.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Orders Fetch Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
