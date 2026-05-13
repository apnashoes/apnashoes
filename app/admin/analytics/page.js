"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// Animated Counter
function AnimatedCounter({ value, duration = 1200 }) {
  const [displayValue, setDisplayValue] = useState(0);
  const startTime = useRef(null);
  const requestRef = useRef();

  useEffect(() => {
    startTime.current = null;
    const animate = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      setDisplayValue(Math.floor(progress * value));
      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      }
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [value, duration]);

  return <>{displayValue.toLocaleString()}</>;
}

// Format PKR
const formatPKR = (amount) => {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export default function AdminAnalyticsPage() {
  const [orders, setOrders] = useState([]);
  const [dateRange, setDateRange] = useState("all");
  const [loading, setLoading] = useState(true);

  // Live counters
  const [liveRevenue, setLiveRevenue] = useState(0);
  const [liveOrders, setLiveOrders] = useState(0);
  const [liveAvgOrder, setLiveAvgOrder] = useState(0);

  const router = useRouter();

  // Auth Check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/admin/me", {
          method: "GET",
          credentials: "include",
          cache: "no-cache",
        });
        const data = await res.json();
        if (!data.success || !data.admin) {
          router.replace("/admin/login");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        router.replace("/admin/login");
      }
    };
    checkAuth();
  }, [router]);

  // Fetch Orders + Live Updates
  useEffect(() => {
    let interval;

    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/admin/orders", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (res.status === 401 || res.status === 403) {
          router.replace("/admin/login");
          return;
        }

        if (!res.ok) throw new Error("Failed to fetch orders");

        const data = await res.json();
        const newOrders = data.orders || [];

        setOrders(newOrders);

        const totalRev = newOrders.reduce(
          (sum, o) => sum + (o.totalAmount || o.total || o.amount || 0),
          0
        );
        const totalCount = newOrders.length;
        const avg = totalCount > 0 ? totalRev / totalCount : 0;

        setLiveRevenue(totalRev);
        setLiveOrders(totalCount);
        setLiveAvgOrder(avg);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    interval = setInterval(fetchOrders, 8000);
    return () => clearInterval(interval);
  }, [router]);

  // Filter Orders
  const getFilteredOrders = () => {
    const now = Date.now();
    if (dateRange === "today") {
      return orders.filter(
        (o) => new Date(o.createdAt).toDateString() === new Date().toDateString()
      );
    }
    if (dateRange === "7days") {
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
      return orders.filter((o) => new Date(o.createdAt).getTime() > weekAgo);
    }
    if (dateRange === "30days") {
      const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
      return orders.filter((o) => new Date(o.createdAt).getTime() > monthAgo);
    }
    return orders;
  };

  const filteredOrders = getFilteredOrders();

  // Daily Chart Data
  const dailyMap = new Map();
  filteredOrders.forEach((o) => {
    const d = new Date(o.createdAt);
    const key = d.toISOString().split("T")[0];
    if (!dailyMap.has(key)) {
      dailyMap.set(key, {
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        orders: 0,
        revenue: 0,
      });
    }
    const entry = dailyMap.get(key);
    entry.orders += 1;
    entry.revenue += o.totalAmount || o.total || o.amount || 0;
  });
  const dailyData = Array.from(dailyMap)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([, v]) => v);

  // Monthly Chart Data
  const monthlyMap = new Map();
  filteredOrders.forEach((o) => {
    const d = new Date(o.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const monthName = d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
    if (!monthlyMap.has(key)) {
      monthlyMap.set(key, { month: monthName, revenue: 0 });
    }
    monthlyMap.get(key).revenue += o.totalAmount || o.total || o.amount || 0;
  });
  const monthlyData = Array.from(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v);

  // Top Products
  const productMap = new Map();
  filteredOrders.forEach((order) => {
    const items = order.items || order.products || [];
    items.forEach((item) => {
      const name = item.name || item.productName || "Unknown Product";
      const qty = item.quantity || 1;
      const price = item.price || 0;
      const revenue = qty * price;

      if (!productMap.has(name)) {
        productMap.set(name, { name, quantity: 0, revenue: 0 });
      }
      const p = productMap.get(name);
      p.quantity += qty;
      p.revenue += revenue;
    });
  });
  const topProducts = Array.from(productMap)
    .map(([, v]) => v)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Top Customers
  const customerMap = new Map();
  filteredOrders.forEach((o) => {
    const email = o.customer?.email || o.customerEmail || "guest@example.com";
    const name = o.customer?.name || o.customerName || email.split("@")[0];
    const amount = o.totalAmount || o.total || o.amount || 0;

    if (!customerMap.has(email)) {
      customerMap.set(email, { name, email, orders: 0, totalSpent: 0 });
    }
    const c = customerMap.get(email);
    c.orders += 1;
    c.totalSpent += amount;
  });
  const topCustomers = Array.from(customerMap)
    .map(([, v]) => v)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10);

  // RFM Customer Segmentation
  const calculateRFM = () => {
    const now = Date.now();
    const customerStats = {};

    filteredOrders.forEach((order) => {
      const email = order.customer?.email || order.customerEmail || "guest@example.com";
      const amount = order.totalAmount || order.total || order.amount || 0;
      const date = new Date(order.createdAt).getTime();

      if (!customerStats[email]) {
        customerStats[email] = {
          email,
          name: order.customer?.name || order.customerName || email.split("@")[0],
          orders: 0,
          totalSpent: 0,
          lastOrder: 0,
        };
      }

      const c = customerStats[email];
      c.orders += 1;
      c.totalSpent += amount;
      if (date > c.lastOrder) c.lastOrder = date;
    });

    Object.values(customerStats).forEach((c) => {
      c.recency = Math.floor((now - c.lastOrder) / (1000 * 60 * 60 * 24));
    });

    const customers = Object.values(customerStats);
    if (customers.length === 0) return [];

    const recencies = customers.map(c => c.recency).sort((a, b) => a - b);
    const frequencies = customers.map(c => c.orders).sort((a, b) => a - b);
    const monetaries = customers.map(c => c.totalSpent).sort((a, b) => a - b);

    const getQuartile = (arr, value) => {
      if (arr.length === 0) return 1;
      const index = arr.findIndex(v => v >= value);
      return index === -1 ? 4 : Math.min(4, Math.ceil((index + 1) / (arr.length / 4)) || 1);
    };

    customers.forEach(c => {
      c.rScore = getQuartile(recencies, c.recency);
      c.fScore = 5 - getQuartile(frequencies, c.orders);
      c.mScore = 5 - getQuartile(monetaries, c.totalSpent);
    });

    const segments = [
      { key: "Champions", condition: c => c.rScore <= 2 && c.fScore >= 3 && c.mScore >= 3, color: "from-yellow-500 to-orange-600", icon: "Crown", strategy: "Reward More", strategyColor: "bg-green-100 text-green-800" },
      { key: "Loyal Customers", condition: c => c.rScore <= 2 && c.fScore >= 2, color: "from-pink-500 to-rose-600", icon: "Heart", strategy: "Upsell & Cross-sell", strategyColor: "bg-blue-100 text-blue-800" },
      { key: "Potential Loyalist", condition: c => c.rScore <= 3 && c.fScore >= 3, color: "from-purple-500 to-indigo-600", icon: "Star", strategy: "Nurture Relationship", strategyColor: "bg-purple-100 text-purple-800" },
      { key: "At Risk", condition: c => c.rScore >= 3 && c.fScore >= 2, color: "from-red-500 to-pink-600", icon: "Warning", strategy: "Win Back Fast!", strategyColor: "bg-red-100 text-red-800" },
      { key: "Lost", condition: c => c.rScore >= 4 && c.fScore <= 2 && c.mScore <= 2, color: "from-gray-600 to-gray-800", icon: "Ghost", strategy: "Reactivate or Archive", strategyColor: "bg-gray-100 text-gray-800" },
      { key: "New Customers", condition: () => true, color: "from-teal-500 to-cyan-600", icon: "Baby", strategy: "Convert to Loyal", strategyColor: "bg-teal-100 text-teal-800" },
    ];

    const result = segments.map(seg => {
      const list = customers.filter(seg.condition);
      const totalRev = list.reduce((sum, c) => sum + c.totalSpent, 0);
      const avgSpend = list.length > 0 ? totalRev / list.length : 0;
      const avgRecency = list.length > 0 ? Math.round(list.reduce((sum, c) => sum + c.recency, 0) / list.length) : 0;

      return {
        name: seg.key,
        count: list.length,
        totalRevenue: totalRev,
        avgSpend: Math.round(avgSpend),
        lastOrder: avgRecency <= 7 ? "This week" : avgRecency <= 30 ? "This month" : `${avgRecency} days ago`,
        color: `bg-gradient-to-br ${seg.color}`,
        icon: seg.icon,
        strategy: seg.strategy,
        strategyColor: seg.strategyColor,
      };
    });

    return result.filter(s => s.count > 0);
  };

  const segments = calculateRFM();

  // Cohort Analysis
  const calculateCohorts = () => {
    const customerFirstOrder = {};
    const cohortData = {};

    filteredOrders.forEach((order) => {
      const email = order.customer?.email || order.customerEmail || "guest@example.com";
      const date = new Date(order.createdAt);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!customerFirstOrder[email]) {
        customerFirstOrder[email] = yearMonth;
      }

      const cohortMonth = customerFirstOrder[email];
      if (!cohortData[cohortMonth]) cohortData[cohortMonth] = {};
      if (!cohortData[cohortMonth][yearMonth]) cohortData[cohortMonth][yearMonth] = new Set();
      cohortData[cohortMonth][yearMonth].add(email);
    });

    const cohorts = Object.keys(cohortData).map(cohortMonth => {
      const months = Object.keys(cohortData[cohortMonth]).sort();
      const firstMonthCustomers = cohortData[cohortMonth][cohortMonth]?.size || 0;

      const row = { cohort: cohortMonth, size: firstMonthCustomers };

      months.forEach((activityMonth, index) => {
        const customers = cohortData[cohortMonth][activityMonth]?.size || 0;
        const retention = firstMonthCustomers > 0 ? (customers / firstMonthCustomers) * 100 : 0;
        row[`month${index}`] = {
          customers,
          retention: retention.toFixed(1),
          percentage: retention
        };
      });

      return row;
    });

    return cohorts.sort((a, b) => b.cohort.localeCompare(a.cohort));
  };

  const cohorts = calculateCohorts();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-2xl font-semibold text-gray-600">Loading Live Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gray-50 w-1/2 md:w-full lg:w-full">
      {/* Header */}
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Live Sales Dashboard</h1>
        <p className="text-lg text-gray-600">Real-time analytics • All amounts in Pakistani Rupees (PKR)</p>
      </div>

      {/* Live Counters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-3xl shadow-2xl p-10 text-center transform hover:scale-105 transition duration-300">
          <p className="text-xl font-medium opacity-90">Live Total Revenue</p>
          <p className="text-6xl font-bold mt-6">{formatPKR(liveRevenue)}</p>
          <p className="text-sm mt-4 opacity-80">Updating live</p>
        </div>
        <div className="bg-gradient-to-br from-green-600 to-green-800 text-white rounded-3xl shadow-2xl p-10 text-center transform hover:scale-105 transition duration-300">
          <p className="text-xl font-medium opacity-90">Live Orders</p>
          <p className="text-6xl font-bold mt-6"><AnimatedCounter value={liveOrders} /></p>
          <p className="text-sm mt-4 opacity-80">Real-time count</p>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-3xl shadow-2xl p-10 text-center transform hover:scale-105 transition duration-300">
          <p className="text-xl font-medium opacity-90">Live Avg Order Value</p>
          <p className="text-6xl font-bold mt-6">{formatPKR(liveAvgOrder)}</p>
          <p className="text-sm mt-4 opacity-80">Dynamic average</p>
        </div>
      </div>

      {/* Date Filter */}
      <div className="flex flex-wrap justify-center gap-4 mb-10">
        {["today", "7days", "30days", "all"].map((r) => (
          <button key={r} onClick={() => setDateRange(r)}
            className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all ${dateRange === r ? "bg-blue-600 text-white shadow-xl" : "bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
            {r === "today" ? "Today" : r === "7days" ? "Last 7 Days" : r === "30days" ? "Last 30 Days" : "All Time"}
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Daily Orders & Revenue</h2>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={dailyData}>
                <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `₨${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => (typeof v === "number" ? formatPKR(v) : v)} />
                <Legend />
                <Bar yAxisId="left" dataKey="orders" fill="#3b82f6" name="Orders" radius={[8, 8, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={5} name="Revenue (PKR)" dot={{ r: 6 }} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : <div className="h-80 flex items-center justify-center text-gray-400 text-xl">No data available</div>}
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Monthly Revenue</h2>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => `₨${(v / 100000).toFixed(0)}L`} />
                <Tooltip formatter={(v) => formatPKR(v)} />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-80 flex items-center justify-center text-gray-400 text-xl">No monthly data</div>}
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-3xl shadow-xl p-8 mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Top 10 Products (by Revenue)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-700 font-semibold">
              <tr>
                <th className="p-4 rounded-l-xl">Rank</th>
                <th className="p-4">Product Name</th>
                <th className="p-4 text-center">Qty Sold</th>
                <th className="p-4 text-right rounded-r-xl">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-500">No product data</td></tr>
              ) : topProducts.map((p, i) => (
                <tr key={i} className="border-b hover:bg-gray-50 transition">
                  <td className="p-4 font-bold text-lg">#{i + 1}</td>
                  <td className="p-4 font-medium">{p.title}</td>
                  <td className="p-4 text-center">{p.quantity.toLocaleString()}</td>
                  <td className="p-4 text-right font-bold text-green-600 text-lg">{formatPKR(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Customers */}
      <div className="bg-white rounded-3xl shadow-xl p-8 mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Top 10 Customers (by Spending)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-700 font-semibold">
              <tr>
                <th className="p-4 rounded-l-xl">Rank</th>
                <th className="p-4">Customer</th>
                <th className="p-4 text-center">Orders</th>
                <th className="p-4 text-right rounded-r-xl">Total Spent</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-500">No customer data</td></tr>
              ) : topCustomers.map((c, i) => (
                <tr key={i} className="border-b hover:bg-gray-50 transition">
                  <td className="p-4 font-bold text-lg">#{i + 1}</td>
                  <td className="p-4">
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-sm text-gray-500">{c.email}</div>
                  </td>
                  <td className="p-4 text-center font-medium">{c.orders}</td>
                  <td className="p-4 text-right font-bold text-green-600 text-lg">{formatPKR(c.totalSpent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RFM Segmentation */}
      <div className="bg-white rounded-3xl shadow-xl p-8 mb-16">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Customer Segmentation (RFM Analysis)</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-10">
          {segments.map((seg) => (
            <div key={seg.name} className={`${seg.color} p-6 rounded-2xl text-white shadow-lg transform hover:scale-105 transition-all duration-300`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold">{seg.name}</h3>
                <span className="text-3xl">{seg.icon}</span>
              </div>
              <p className="text-3xl font-bold">{seg.count}</p>
              <p className="text-sm opacity-90 mt-1">customers</p>
              <p className="text-xs mt-3 opacity-80">Avg: {formatPKR(seg.avgSpend)}</p>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-700 font-semibold">
              <tr>
                <th className="p-4 rounded-l-xl">Segment</th>
                <th className="p-4">Customers</th>
                <th className="p-4">Total Revenue</th>
                <th className="p-4">Avg Spend</th>
                <th className="p-4 text-center">Last Order</th>
                <th className="p-4 text-right rounded-r-xl">Strategy</th>
              </tr>
            </thead>
            <tbody>
              {segments.map((seg, i) => (
                <tr key={i} className="border-b hover:bg-gray-50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{seg.icon}</span>
                      <div className="font-bold text-gray-800">{seg.name}</div>
                    </div>
                  </td>
                  <td className="p-4 font-medium">{seg.count}</td>
                  <td className="p-4 font-bold text-green-600">{formatPKR(seg.totalRevenue)}</td>
                  <td className="p-4">{formatPKR(seg.avgSpend)}</td>
                  <td className="p-4 text-center text-sm">{seg.lastOrder}</td>
                  <td className="p-4 text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${seg.strategyColor}`}>
                      {seg.strategy}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cohort Analysis */}
      <div className="bg-white rounded-3xl shadow-xl p-8 mb-16">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Cohort Analysis • Monthly Retention Heatmap
        </h2>
        <p className="text-gray-600 mb-6">Shows % of customers from each acquisition month who returned in following months</p>

        {cohorts.length === 0 ? (
          <div className="text-center py-16 text-gray-500">Not enough data for cohort analysis</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-4 text-left font-bold text-gray-700">Cohort Month</th>
                  <th className="p-4 text-center font-bold text-gray-700">Initial</th>
                  {cohorts[0] && Object.keys(cohorts[0]).filter(k => k.startsWith("month")).slice(0, 8).map((_, i) => (
                    <th key={i} className="p-4 text-center font-bold text-gray-700">+{i + 1}m</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cohorts.map((cohort, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-800">
                      {new Date(cohort.cohort + "-01").toLocaleDateString("en-US", { year: "numeric", month: "short" })}
                      <br />
                      <span className="text-xs text-gray-500">{cohort.size} customers</span>
                    </td>
                    <td className="p-4 text-center font-bold text-green-600">100%</td>
                    {Object.keys(cohort).filter(k => k.startsWith("month")).slice(0, 8).map((monthKey, i) => {
                      const data = cohort[monthKey];
                      const intensity = data ? Math.min(data.percentage / 100 * 255, 255) : 0;
                      const bgColor = data ? `rgb(${255 - intensity}, ${255 - intensity / 2}, ${255 - intensity / 3})` : "#f3f4f6";
                      return (
                        <td
                          key={i}
                          className="p-4 text-center font-semibold"
                          style={{ backgroundColor: bgColor, color: data && data.percentage > 50 ? "white" : "inherit" }}
                        >
                          {data ? `${data.retention}%` : "-"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 flex items-center gap-8 justify-center text-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded" style={{ backgroundColor: "rgb(50, 50, 50)" }}></div>
            <span>High Retention (80–100%)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded" style={{ backgroundColor: "#e5e7eb" }}></div>
            <span>Low / No Activity</span>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="text-center pb-10">
        <button onClick={() => router.push("/admin/orders")}
          className="px-12 py-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-2xl font-bold rounded-3xl hover:shadow-2xl transform hover:scale-105 transition duration-300">
          Back to Orders
        </button>
      </div>
    </div>
  );
}