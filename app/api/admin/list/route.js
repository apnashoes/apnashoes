import dbConnect from "@/lib/db";
import Admin from "@/models/Admin";

export async function GET() {
  await dbConnect();
  const admins = await Admin.find().lean();
  return Response.json({ admins });
}
