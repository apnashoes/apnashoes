"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  { name: "Dashboard", href: "/admin/dashboard" },
  { name: "Products List", href: "/admin/productList" },
  { name: "Order Analytics", href: "/admin/analytics" },
  { name: "Orders", href: "/admin/orders" },
  { name: "Users", href: "/admin/users" },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  const handleLinkClick = () => {
    onClose(); // This closes the sidebar on mobile when any link is clicked
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-64 bg-[#111827] text-white
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="p-4">
          <h2 className="text-xl font-bold mb-8 hidden md:block">
            TimeTex Fabrics
          </h2>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick} // This will close sidebar on mobile
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === item.href
                  ? "bg-gray-700 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}