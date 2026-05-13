"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DateRangePicker from "../components/DateRangePicker";
import StatCard from "../components/StatCard";
import Link from "next/link";

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 🔐 Check login + fetch data using cookies
  useEffect(() => {
    // 1️⃣ Check if admin is logged in
    fetch("/api/admin/me", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success || !data.admin) {
          router.push("/admin/login"); // 🔄 redirect if no login
        }
      });

    // 2️⃣ Load Orders
    fetch("/api/admin/orders", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Loading Dashboard...</p>
      </div>
    );
  }

  // 🧮 Normalize and count statuses safely
  const normalize = (status) => status?.toLowerCase() || "";

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (o) => normalize(o.status) === "pending"
  ).length;
  const deliveredOrders = orders.filter(
    (o) => normalize(o.status) === "delivered"
  ).length;
  const canceledOrders = orders.filter((o) =>
    ["canceled", "cancelled"].includes(normalize(o.status))
  ).length;

  // 🕒 Get the 5 most recent orders
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {/* <div className="bg-white p-4 rounded-2xl shadow">
        <h2 className="text-lg font-medium mb-4">Select Date Range</h2>
        <DateRangePicker />
      </div> */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <Link href="/admin/ProductForm">
          <div className="bg-red-200 rounded-2xl shadow p-8 flex flex-col justify-between">
            <h3 className="text-gray-500 text-sm font-medium text-center my-auto">
              Add New Product
            </h3>
          </div>
        </Link>
        <Link href="/admin/register">
          <div className="bg-green-200 rounded-2xl shadow p-8 flex flex-col justify-between">
            <h3 className="text-gray-500 text-sm font-medium text-center my-auto">
              Add New Admin
            </h3>
          </div>
        </Link>
      </div>

      {/* Stats Summary Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <StatCard title="Total Orders" value={orders.length} />
        <StatCard
          title="Pending Orders"
          value={orders.filter((o) => o.status === "pending").length}
        />
        <StatCard
          title="Delivered Orders"
          value={orders.filter((o) => o.status === "Delivered").length}
          valueColor="text-green-600"
        />
        <StatCard
          title="Canceled Orders"
          value={orders.filter((o) => o.status === "cancelled").length}
          valueColor="text-red-500"
        />
      </div>

      {/* Orders List */}
      <div className="bg-white p-4 rounded-2xl shadow mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="text-blue-600 text-sm hover:underline"
          >
            View All Orders →
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <ul className="divide-y">
            {recentOrders.map((o) => (
              <li key={o._id} className="py-2">
                <p>
                  <b>Order ID:</b> {o._id}
                </p>
                <p>
                  <b>Status:</b>{" "}
                  <span
                    className={`${
                      normalize(o.status) === "pending"
                        ? "text-yellow-500"
                        : normalize(o.status) === "delivered"
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {o.status}
                  </span>
                </p>
                {o.createdAt && (
                  <p className="text-gray-500 text-xs">
                    {new Date(o.createdAt).toLocaleString()}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">No orders found.</p>
        )}
      </div>
    </div>
  );
}
