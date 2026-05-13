import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// GET Wishlist
export async function GET() {
  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await User.findOne({ email: session.user.email });

  return Response.json(user.wishlist || []);
}

// ADD to Wishlist
export async function POST(req) {
  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const item = await req.json();

  const user = await User.findOne({ email: session.user.email });

  const exists = user.wishlist.find(
    (i) => i.productId === item.productId
  );

  if (!exists) {
    user.wishlist.push(item);
    await user.save();
  }

  return Response.json({ success: true });
}

// REMOVE from Wishlist
export async function DELETE(req) {
  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId } = await req.json();

  const user = await User.findOne({ email: session.user.email });

  user.wishlist = user.wishlist.filter(
    (item) => item.productId !== productId
  );

  await user.save();

  return Response.json({ success: true });
}