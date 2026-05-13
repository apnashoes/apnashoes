import dbConnect from "@/lib/db";
import Admin from "@/models/Admin";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req) {
  await dbConnect();

  const { username, password } = await req.json();

  if (!username || !password)
    return NextResponse.json({ error: "All fields required" }, { status: 400 });

  if (username.toLowerCase() === "hamza")
    return NextResponse.json(
      { error: "Super Admin already exists!" },
      { status: 403 }
    );

  const hashedPassword = await bcrypt.hash(password, 10);

  const newAdmin = await Admin.create({
    username,
    password: hashedPassword,
  });

  return NextResponse.json({ message: "Admin created", admin: newAdmin });
}
