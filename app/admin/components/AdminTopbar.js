"use client";

import { useEffect, useState } from "react";
import { Search, LogOut, Menu } from "lucide-react";

export default function AdminTopbar({ onOpenSidebar }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await fetch("/api/admin/me", { cache: "no-store" });
        const data = await res.json();
        if (data.success && data.admin) setUser(data.admin);
      } catch (err) {
        console.error("Failed to fetch admin:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdmin();
  }, []);

  if (loading || !user) return null;

  const username = user.username;
  const firstLetter = username.charAt(0).toUpperCase();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "GET" });
    window.location.href = "/admin";
  };

  return (
    <header className="bg-white shadow p-4 flex items-center justify-between gap-4">

      {/* LEFT AREA — MOBILE MENU + SEARCH */}
      <div className="flex items-center gap-3 flex-1">

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded-md bg-gray-100"
          onClick={onOpenSidebar}
        >
          <Menu size={20} />
        </button>

        {/* Search Bar */}
        <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full w-full md:w-64">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>
      </div>

      {/* RIGHT AREA — USER INFO */}
      <div className="flex items-center gap-4">

        <span className="text-gray-700 font-medium hidden sm:block">
          {username}
        </span>

        <div className="w-9 h-9 bg-orange-600 text-white rounded-full flex items-center justify-center font-semibold">
          {firstLetter}
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1 bg-red-500 text-white px-3 py-2 rounded-md text-sm hover:bg-red-600"
        >
          <LogOut size={16} />
          <span className="hidden sm:block">Logout</span>
        </button>
      </div>
    </header>
  );
}
