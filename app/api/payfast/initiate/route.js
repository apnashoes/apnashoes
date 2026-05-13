import crypto from "crypto";

export async function POST(req) {
  try {
    const { orderData } = await req.json();

    const {
      total,
      customer: { name, email, phone } = {},
    } = orderData || {};

    if (!total || !name || !email || !phone) {
      console.error("❌ Missing required fields:", { total, name, email, phone });
      return Response.json({ success: false, message: "Invalid order data" }, { status: 400 });
    }

    // ✅ Environment setup
    const merchant_id = process.env.PAYFAST_MERCHANT_ID || "10000100";
    const merchant_key = process.env.PAYFAST_MERCHANT_KEY || "46f0cd694581a";
    const passphrase = process.env.PAYFAST_PASSPHRASE || "";

    const return_url = process.env.PAYFAST_RETURN_URL || "https://yourdomain.com/success";
    const cancel_url = process.env.PAYFAST_CANCEL_URL || "https://yourdomain.com/cancel";
    const notify_url = process.env.PAYFAST_NOTIFY_URL || "https://yourdomain.com/api/payfast/notify";

    // ✅ Normalize Pakistani phone number
    const normalizePhone = (num) => {
      if (!num) return "";
      let clean = num.replace(/\D/g, "");
      if (clean.startsWith("0")) clean = "92" + clean.slice(1);
      else if (clean.startsWith("+92")) clean = clean.replace("+", "");
      else if (!clean.startsWith("92")) clean = "92" + clean;
      return clean;
    };
    const fixedPhone = normalizePhone(phone);

    // ✅ Prepare PayFast Parameters
    const params = {
      merchant_id,
      merchant_key,
      return_url,
      cancel_url,
      notify_url,
      name_first: name.split(" ")[0] || "Customer",
      name_last: name.split(" ")[1] || "",
      email_address: email,
      m_payment_id: `ORDER-${Date.now()}`,
      amount: Number(total).toFixed(2),
      item_name: "Order Payment",
      cell_number: fixedPhone,
      email_confirmation: 1,
      confirmation_address: email,
      custom_str1: orderData._id || "",
    };

    // ✅ Generate Signature
    const paramString = Object.entries(params)
      .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
      .join("&");

    const signatureBase = passphrase
      ? `${paramString}&passphrase=${encodeURIComponent(passphrase)}`
      : paramString;

    const signature = crypto.createHash("md5").update(signatureBase).digest("hex");
    const fullParams = { ...params, signature };

    // ✅ Dynamic PayFast Environment Check
    let payfastUrl = "https://ipg2stage.apps.net.pk/payfast/eng/process"; // sandbox by default

    try {
      const res = await fetch(payfastUrl, { method: "HEAD", timeout: 5000 });
      if (!res.ok) throw new Error("Sandbox not reachable");
      console.log("✅ Sandbox reachable");
    } catch {
      console.warn("⚠️ Sandbox server unreachable — switching to LIVE PayFast");
      payfastUrl = "https://ipg2.apps.net.pk/payfast/eng/process";
    }

    console.log("✅ Final PayFast URL:", payfastUrl);
    console.log("✅ Sending Params:", fullParams);

    return Response.json({
      success: true,
      payfastUrl,
      params: fullParams,
    });
  } catch (error) {
    console.error("PayFast initiation error:", error);
    return Response.json(
      { success: false, message: "PayFast initiation failed", error: error.message },
      { status: 500 }
    );
  }
}
