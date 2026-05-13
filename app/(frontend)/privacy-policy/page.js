import React from "react";
import PolicyLayout from "@/component/PolicyLayout";

export default function PrivacyPolicy() {
  return (
    <PolicyLayout title="Privacy Policy">
      <div className="max-w-4xl mx-auto px-4 py-10">

        <p className="mb-4">
          We respect your privacy and are committed to protecting your personal
          information.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          Information We Collect
        </h2>
        <p className="mb-4">
          We collect information such as name, email, phone number, and address
          when you place an order.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          How We Use Information
        </h2>
        <p className="mb-4">
          Your information is used to process orders and improve our services.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Contact</h2>
        <p>Email: apnashoes549@gmail.com</p>
        <p>Phone: 03XXXXXXXXX</p>
      </div>
    </PolicyLayout>
  );
}
