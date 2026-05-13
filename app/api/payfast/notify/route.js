import crypto from "crypto";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const data = Object.fromEntries(formData.entries());
    const passphrase = process.env.PAYFAST_PASSPHRASE || "";

    // ✅ Step 1: Rebuild signature string in correct order
    const filteredData = Object.entries(data)
      .filter(([key]) => key !== "signature")
      .sort(([a], [b]) => a.localeCompare(b));

    let signatureString = filteredData
      .map(([key, value]) => `${key}=${encodeURIComponent(value.trim())}`)
      .join("&");

    if (passphrase) {
      signatureString += `&passphrase=${encodeURIComponent(passphrase)}`;
    }

    const signature = crypto
      .createHash("md5")
      .update(signatureString)
      .digest("hex");

    if (signature !== data.signature) {
      return new Response("Invalid signature", { status: 400 });
    }

    // ✅ Step 2: Validate source (optional but recommended)
    const validateUrl =
      process.env.PAYFAST_MODE === "live"
        ? "https://www.payfast.co.za/eng/query/validate"
        : "https://sandbox.payfast.co.za/eng/query/validate";

    const validateRes = await fetch(validateUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: signatureString,
    });

    const validation = await validateRes.text();
    if (validation !== "VALID") {
      console.warn("Invalid PayFast source:", validation);
      return new Response("Invalid source", { status: 400 });
    }

    // ✅ Step 3: Update order in DB
    await dbConnect();
    const orderId = data.custom_str1;
    if (!orderId) return new Response("Missing order ID", { status: 400 });

    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: data.payment_status,
      paymentData: data,
    });

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("PayFast notify error:", error);
    return new Response("Error", { status: 500 });
  }
}
