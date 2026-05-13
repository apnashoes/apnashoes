import dbConnect from "@/lib/db";
import Admin from "@/models/Admin";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
  await dbConnect();

  const admin = await Admin.findById(params.id);

  if (!admin) return NextResponse.json({ error: "Admin not found" }, { status: 404 });

  // ❌ prevent deleting super admin "Jamshed"
  if (admin.username.toLowerCase() === "jamshed") {
    return NextResponse.json(
      { error: "Super Admin cannot be deleted" },
      { status: 403 }
    );
  }

  await Admin.findByIdAndDelete(params.id);

  return NextResponse.json({ message: "Admin deleted successfully" });
}
