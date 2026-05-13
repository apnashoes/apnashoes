import React from "react";
import PolicyLayout from "@/component/PolicyLayout";

export default function RefundPolicy() {
  return (
    <PolicyLayout title="Refund & Return Policy">
      <div className="max-w-4xl mx-auto px-4 py-10">

        <p className="mb-4">Thank you for shopping with us.</p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Returns</h2>
        <p className="mb-4">
          We accept returns within 7 days of receiving your order. To be
          eligible for a return:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>
            The item must be unused and in the same condition that you received
            it
          </li>
          <li>The item must be in its original packaging</li>
          <li>Proof of purchase is required</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          Non-Returnable Items
        </h2>
        <ul className="list-disc pl-6 mb-4">
          <li>Used or worn products</li>
          <li>Items damaged by the customer</li>
          <li>Clearance or sale items (if applicable)</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">Refunds</h2>
        <p>Once we receive and inspect your returned item:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>We will notify you of the approval or rejection</li>
          <li>
            If approved, your refund will be processed within 5–7 working days
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          Late or Missing Refunds
        </h2>
        <p>If you haven’t received your refund:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Check your bank account again</li>
          <li>Contact your bank or payment provider</li>
          <li>If still not received, contact us</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">Shipping Costs</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>Shipping charges are non-refundable</li>
          <li>Customers are responsible for return shipping costs</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">Contact Us</h2>
        <p>Email: apnashoes549@gmail.com</p>
        <p>Phone: 03XXXXXXXXX</p>
      </div>
    </PolicyLayout>
  );
}
