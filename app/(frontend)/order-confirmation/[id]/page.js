"use client";
import { useEffect, useState, useRef } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Image from "next/image";
import { useParams } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import OrderTimeline from "@/component/OrderTimeline";

export default function OrderConfirmation() {
  const params = useParams();
  const id = params?.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // store last status to compare
  const lastStatusRef = useRef(null);

  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-700",
    Processing: "bg-blue-100 text-blue-700",
    Shipped: "bg-green-100 text-green-700",
    Completed: "bg-green-200 text-green-800",
    Cancelled: "bg-red-100 text-red-700",
  };

  // 📌 FETCH ORDER (single API call)
  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`);
      const data = await res.json();

      if (res.ok) {
        // first time store status
        if (!lastStatusRef.current) {
          lastStatusRef.current = data.status;
        }

        // if status changed → popup
        if (lastStatusRef.current !== data.status) {
          Swal.fire({
            title: "Order Status Updated!",
            text: `New Status: ${data.status}`,
            icon: "info",
            confirmButtonColor: "#000",
          });
          lastStatusRef.current = data.status;
        }

        setOrder(data);
      }
    } catch (err) {
      console.log("Fetch Order Error:", err);
    }
  };

  // INITIAL LOAD
  useEffect(() => {
    if (!id) return;
    fetchOrder().then(() => setLoading(false));
  }, [id]);

  // 🔥 REAL-TIME AUTO UPDATE (every 5 seconds)
  useEffect(() => {
    if (!id) return;
    const interval = setInterval(fetchOrder, 5000); // 5s refresh
    return () => clearInterval(interval);
  }, [id]);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!order)
    return (
      <div className="text-center py-10 text-red-600">Order not found.</div>
    );

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-8 md:mt-32 mt-16 border border-gray-200">

      {/* HEADER */}
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="logo" width={60} height={60} />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">TimeTex Fabrics</h1>
            <p className="text-sm text-gray-500">123 Demo Street, Karachi</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm font-medium">Order ID: {order._id}</p>
          <p className="text-sm">
            Date: {new Date(order.createdAt).toLocaleDateString()}
          </p>

          {/* STATUS BADGE */}
          <p className="mt-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                statusColors[order.status] || "bg-gray-200 text-gray-600"
              }`}
            >
              {order.status}
            </span>
          </p>
        </div>
      </div>

      <OrderTimeline order={order} />

      {/* CUSTOMER */}
      <div className="border p-3 rounded-lg mb-4 bg-gray-50">
        <h3 className="font-medium text-gray-700 mb-1">Order Status</h3>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            statusColors[order.status] || "bg-gray-200 text-gray-700"
          }`}
        >
          {order.status}
        </span>
      </div>

      <div className="border p-3 rounded-lg mb-6 bg-gray-50">
        <p className="text-gray-700 font-medium">{order.customer.name}</p>
        <p className="text-gray-600">{order.customer.phone}</p>
        <p className="text-gray-600">{order.customer.address}</p>
      </div>

      {/* TABLE */}
      <table className="w-full text-left border border-gray-200 rounded-lg overflow-hidden mb-4">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-3">Item</th>
            <th className="py-2 px-3">Qty</th>
            <th className="py-2 px-3">Price</th>
            <th className="py-2 px-3">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, i) => (
            <tr key={i} className="border-b">
              <td className="py-2 px-3">{item.title}</td>
              <td className="py-2 px-3">{item.quantity}</td>
              <td className="py-2 px-3">Rs. {item.price.toLocaleString()}</td>
              <td className="py-2 px-3">
                Rs. {(item.quantity * item.price).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* TOTAL */}
      <div className="text-right mb-8">
        <p className="text-lg font-semibold">
          Grand Total: Rs. {order.total.toLocaleString()}
        </p>
        <p className="text-sm text-gray-500">
          Payment: {order.paymentMethod.toUpperCase()}
        </p>
      </div>

      {/* BUTTONS */}
      <div className="flex justify-end gap-4">
        <Link
          href="/"
          className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-black/85 transition font-medium"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
