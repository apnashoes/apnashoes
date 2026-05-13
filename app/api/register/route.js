import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return Response.json({ message: "User already exists" }, { status: 400 });
    }

    // 🔐 HASH PASSWORD HERE
    const hashedPassword = await bcrypt.hash(password, 10);


    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword, // optional for now
    });

    return Response.json({ message: "User created", user });
  } catch (error) {
    return Response.json({ message: "Error", error }, { status: 500 });
  }
}