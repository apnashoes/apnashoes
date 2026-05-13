import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Admin from "@/models/Admin";
import jwt from "jsonwebtoken";

export async function GET(req) {
  await dbConnect();

  try {
    const token = req.cookies.get("adminToken")?.value;

    if (!token) {
      return NextResponse.json({ success: false, admin: null });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      return NextResponse.json({ success: false, admin: null });
    }

    return NextResponse.json({
      success: true,
      admin,
    });
  } catch (err) {
    return NextResponse.json({ success: false, admin: null });
  }
}
