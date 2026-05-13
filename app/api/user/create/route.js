import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req) {
  const body = await req.json();

  await connectDB();

  const user = await User.create(body);

  return Response.json(user);
}