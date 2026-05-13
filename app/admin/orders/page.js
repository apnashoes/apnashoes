"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [loading, setLoading] = useState(true);

  // UI enhancements
  const [newOrderIds, setNewOrderIds] = useState(new Set());
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);

  const router = useRouter();
  const ordersPerPage = 10;

  const prevOrderIdsRef = useRef(new Set());
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  const isNewByTime = (order) => {
    if (!order.createdAt) return false;
    const diff = Date.now() - new Date(order.createdAt).getTime();
    return diff < 48 * 60 * 60 * 1000; // 48 hours
  };

  const normalize = (status) => status?.toLowerCase() || "";

  /** ONLY return true when order was newly fetched */
  const isNewOrderVisual = (order) => {
    return newOrderIds.has(order._id) || isNewByTime(order);
  };

  const fetchOrders = async (showToastOnNew = true) => {
    try {
      // const token = localStorage.getItem("adminToken");
      // if (!token) {
      //   router.push("/admin/login");
      //   return;
      // }

      const res = await fetch("/api/admin/orders", {
        // headers: { Authorization: `Bearer ${token}` },
        credentials: "include", // ✅ IMPORTANT
        cache: "no-store",
      });
      const data = await res.json();
      const ordersData = data.orders || [];

      const fetchedIds = new Set(ordersData.map((o) => o._id));
      const prevIds = prevOrderIdsRef.current || new Set();

      // detect new orders
      const newIds = [...fetchedIds].filter((id) => !prevIds.has(id));

      if (newIds.length > 0) {
        setNewOrderIds((prev) => {
          const s = new Set(prev);
          newIds.forEach((id) => s.add(id));
          return s;
        });

        if (showToastOnNew) {
          setToastMessage(
            `${newIds.length} new order${newIds.length > 1 ? "s" : ""} received`
          );
          setShowToast(true);
          setTimeout(() => setShowToast(false), 5000);

          if (soundEnabled && audioRef.current) {
            try {
              audioRef.current.currentTime = 0;
              audioRef.current.play();
            } catch {}
          }
        }
      }

      prevOrderIdsRef.current = fetchedIds;
      setOrders(ordersData);
      setFilteredOrders(ordersData);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      await fetchOrders(false);
      if (!mounted) return;
      intervalRef.current = setInterval(() => fetchOrders(true), 10000);
    })();

    return () => {
      mounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [router, soundEnabled]);

  const updateStatus = async (id, status) => {
    try {
      // const token = localStorage.getItem("adminToken");
      await fetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // Authorization: token ? `Bearer ${token}` : undefined,
        },
        credentials: "include", // ✅ IMPORTANT
        body: JSON.stringify({ status }),
      });

      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status } : o))
      );
      setFilteredOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status } : o))
      );

      // When status is changed, remove NEW tag
      setNewOrderIds((prev) => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  useEffect(() => {
    let result = [...orders];

    if (statusFilter !== "all") {
      if (statusFilter === "canceled") {
        result = result.filter((o) =>
          ["canceled", "cancelled"].includes(normalize(o.status))
        );
      } else {
        result = result.filter((o) => normalize(o.status) === statusFilter);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o._id?.toLowerCase().includes(q) ||
          (o.customer?.name || o.customerName || "").toLowerCase().includes(q)
      );
    }

    setFilteredOrders(result);
    setCurrentPage(1);
  }, [statusFilter, searchQuery, orders]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const { key, direction } = sortConfig;
    const dir = direction === "asc" ? 1 : -1;

    if (key === "createdAt") {
      return (new Date(a.createdAt) - new Date(b.createdAt)) * dir;
    }

    const valA = (a[key] || "").toString().toLowerCase();
    const valB = (b[key] || "").toString().toLowerCase();

    if (valA < valB) return -1 * dir;
    if (valA > valB) return 1 * dir;
    return 0;
  });

  const indexOfLast = currentPage * ordersPerPage;
  const indexOfFirst = indexOfLast - ordersPerPage;
  const currentOrders = sortedOrders.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sortedOrders.length / ordersPerPage);

  const nextPage = () =>
    setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
  const prevPage = () => setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));

  const handleToastClick = () => {
    fetchOrders(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setShowToast(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Loading Orders...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gray-50">
      <audio
        ref={audioRef}
        src="/notification.mp3"
        preload="auto"
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            All Orders
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Polling every 10s · {orders.length} total orders
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={() => setSoundEnabled((s) => !s)}
              className="h-5 w-5 rounded border-gray-300"
            />
            <span>Sound</span>
          </label>

          <button
            onClick={() => {
              setLoading(true);
              fetchOrders(true).finally(() => setLoading(false));
            }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition"
          >
            Refresh
          </button>

          <button
            onClick={() => router.push("/admin/dashboard")}
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-pulse">
          <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-4 max-w-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-full animate-pulse" />
              <div>
                <p className="font-semibold text-gray-800">{toastMessage}</p>
                <p className="text-sm text-gray-600">Click to view</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleToastClick}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
              >
                View Now
              </button>
              <button
                onClick={() => setShowToast(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg text-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
          {["all", "pending", "delivered", "canceled"].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap ${
                statusFilter === filter
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Order ID or Customer Name..."
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700 font-medium">
              <tr>
                {[
                  ["_id", "Order ID"],
                  ["customer", "Customer"],
                  ["status", "Status"],
                  ["createdAt", "Date"],
                ].map(([key, label]) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className="px-6 py-4 text-left cursor-pointer hover:bg-gray-200 transition whitespace-nowrap"
                  >
                    {label}{" "}
                    {sortConfig.key === key && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {currentOrders.map((order) => {
                const customerName =
                  order.customer?.name || order.customerName || "N/A";
                const customerEmail = order.customer?.email || "";
                const highlight = isNewOrderVisual(order);

                return (
                  <tr
                    key={order._id}
                    className={`transition-all ${
                      highlight
                        ? "bg-yellow-50 animate-pulse"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4 font-mono text-blue-600 text-xs">
                      {order._id}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {customerName}

                            {/* NEW badge ONLY for new fetched orders */}
                            {isNewOrderVisual(order) && (
                              <span className="text-xs bg-red-600 text-white px-3 py-1 rounded-full animate-pulse">
                                NEW
                              </span>
                            )}

                            {/* Pending indicator only */}
                            {normalize(order.status) === "pending" && (
                              <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                            )}
                          </div>

                          <div className="text-xs text-gray-500">
                            {customerEmail}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateStatus(order._id, e.target.value)
                        }
                        className={`px-4 py-2 rounded-lg font-medium border text-sm focus:outline-none focus:ring-2 ${
                          normalize(order.status) === "pending"
                            ? "bg-yellow-100 text-yellow-800 border-yellow-400"
                            : normalize(order.status) === "completed"
                            ? "bg-green-100 text-green-800 border-green-400"
                            : normalize(order.status).includes("cancel")
                            ? "bg-red-100 text-red-800 border-red-400"
                            : "bg-gray-100 text-gray-700 border-gray-400"
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="shipped">Shipped</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="px-6 py-4 text-gray-600 text-sm whitespace-nowrap">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden">
          {currentOrders.length > 0 ? (
            currentOrders.map((order) => {
              const customerName =
                order.customer?.name || order.customerName || "N/A";
              const customerEmail = order.customer?.email || "";
              const highlight = isNewOrderVisual(order);

              return (
                <div
                  key={order._id}
                  className={`p-5 border-b border-gray-200 ${
                    highlight ? "bg-yellow-50" : "bg-white"
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-mono text-blue-600 font-bold text-sm">
                        {order._id}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {order.createdAt
                          ? `${new Date(
                              order.createdAt
                            ).toLocaleDateString()} • ${new Date(
                              order.createdAt
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}`
                          : "—"}
                      </div>
                    </div>

                    {isNewOrderVisual(order) && (
                      <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full">
                        NEW
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="font-semibold text-gray-800 flex items-center gap-2">
                      {customerName}
                      {normalize(order.status) === "pending" && (
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                      )}
                    </div>
                    <div className="text-sm text-gray-600">{customerEmail}</div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      Status:
                    </span>

                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                      className={`px-4 py-2.5 rounded-lg font-medium text-sm border focus:outline-none focus:ring-2 ${
                        normalize(order.status) === "pending"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-400"
                          : normalize(order.status) === "completed"
                          ? "bg-green-100 text-green-800 border-green-400"
                          : normalize(order.status).includes("cancel")
                          ? "bg-red-100 text-red-800 border-red-400"
                          : "bg-gray-100 text-gray-700 border-gray-400"
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="shipped">Shipped</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-gray-500">
              No orders found
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className={`px-6 py-3 rounded-xl font-medium transition ${
              currentPage === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            ← Previous
          </button>

          <span className="text-gray-700 font-medium">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className={`px-6 py-3 rounded-xl font-medium transition ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
