import React from "react";
import PolicyLayout from "@/component/PolicyLayout";

export default function Terms() {
  return (
    <PolicyLayout title="Terms & Conditions">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <p className="mb-4">
          By using our website, you agree to the following terms and conditions.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Orders</h2>
        <p className="mb-4">
          All orders are subject to availability and confirmation.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Pricing</h2>
        <p className="mb-4">Prices are subject to change without notice.</p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Liability</h2>
        <p>
          We are not responsible for any damages resulting from use of our
          products.
        </p>
      </div>
    </PolicyLayout>
  );
}
