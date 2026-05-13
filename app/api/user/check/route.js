import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req) {
  const { email } = await req.json();

  await connectDB();

  const user = await User.findOne({ email });

  return Response.json({ exists: !!user });
}