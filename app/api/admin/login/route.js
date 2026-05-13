import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import Admin from "@/models/Admin";

export async function POST(req) {
  await dbConnect();
  try {
    const { username, password } = await req.json();

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 },
      );
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing in environment variables");
    }

    // ✅ Generate token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    const token = await new SignJWT({
      id: admin._id.toString(),
      username: admin.username,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1d")
      .sign(secret);

    // ✅ Set token in HTTP-only cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set("adminToken", token, {
      httpOnly: true, // prevent JS access (XSS safe)
      secure: process.env.NODE_ENV === "production", // only HTTPS in prod
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
