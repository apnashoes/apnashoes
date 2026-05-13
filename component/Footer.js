"use client";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";

export default function PremiumFooter() {
  return (
    <footer className="relative bg-[#0a0a0a] text-gray-300 mt-24 overflow-hidden">
      {/* Glow Background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 via-transparent to-yellow-400/10 blur-3xl opacity-30"></div>

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        {/* TOP GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* BRAND */}
          <div className="lg:col-span-2">
            <h2 className="text-4xl font-extrabold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Apna Shoes
            </h2>

            <p className="mt-5 text-gray-400 max-w-md leading-relaxed">
              Step into premium comfort and street-ready style. Built for those
              who move different.
            </p>

            {/* Social */}
            <div className="flex gap-4 mt-6">
              {[FaFacebookF, FaInstagram, FaTiktok, FaYoutube].map(
                (Icon, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-gradient-to-r hover:from-orange-500 hover:to-yellow-400 transition duration-300 cursor-pointer"
                  >
                    <Icon className="text-sm" />
                  </div>
                ),
              )}
            </div>
          </div>

          {/* LINKS */}
          <div>
            <h3 className="text-white font-semibold mb-5 tracking-wide">
              SHOP
            </h3>
            <ul className="space-y-3 text-sm">
              {["Sneakers", "Running", "Casual", "New Arrivals"].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="hover:text-white transition relative group"
                  >
                    {item}
                    <span className="block h-[1px] w-0 bg-white group-hover:w-full transition-all"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* SUPPORT */}
          <div>
            <h3 className="text-white font-semibold mb-5 tracking-wide">
              SUPPORT
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                {
                  name: "Contact Us",
                  link: "/contact",
                },
                {
                  name: "Privacy Policy",
                  link: "/privacy-policy",
                },
                {
                  name: "Refund Policy",
                  link: "/refund-policy",
                },
                {
                  name: "Terms & Conditions",
                  link: "/terms",
                },
                {
                  name: "Order Tracking",
                  link: "/terms",
                },
              ].map((item, i) => (
                <li key={i}>
                  <Link
                    href={item.link}
                    className="hover:text-white transition relative group"
                  >
                    {item.name}
                    <span className="block h-[1px] w-0 bg-white group-hover:w-full transition-all"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* NEWSLETTER */}
          <div>
            <h3 className="text-white font-semibold mb-5 tracking-wide">
              JOIN THE CLUB
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Get exclusive drops & offers.
            </p>

            <div className="flex items-center bg-white/5 border border-white/10 rounded-full overflow-hidden backdrop-blur">
              <input
                type="email"
                placeholder="Email address"
                className="bg-transparent px-4 py-2 w-full text-sm outline-none"
              />
              <button className="bg-gradient-to-r from-orange-500 to-yellow-400 text-black px-5 py-2 text-sm font-semibold hover:opacity-90 transition">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* TRUST + PAYMENTS */}
        <div className="mt-14 border-t border-white/10 pt-8 flex flex-col lg:flex-row justify-between items-center gap-6">
          {/* Trust Badges */}
          <div className="flex flex-wrap gap-4 text-xs text-gray-400">
            <span className="bg-white/5 px-3 py-1 rounded-full">
              🚚 Cash on Delivery
            </span>
            <span className="bg-white/5 px-3 py-1 rounded-full">
              🔒 Secure Payment
            </span>
            <span className="bg-white/5 px-3 py-1 rounded-full">
              ↩️ Easy Returns
            </span>
          </div>

          {/* Payment Methods */}
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="opacity-70">We Accept:</span>
            <div className="flex gap-3">
              <span className="bg-white/5 px-3 py-1 rounded-md">JazzCash</span>
              <span className="bg-white/5 px-3 py-1 rounded-md">Easypaisa</span>
              <span className="bg-white/5 px-3 py-1 rounded-md">Visa</span>
              <span className="bg-white/5 px-3 py-1 rounded-md">
                MasterCard
              </span>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="mt-10 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} Apna Shoes. All rights reserved.</p>

          <div className="flex gap-6">
            {["Privacy", "Terms", "Cookies"].map((item) => (
              <Link key={item} href="#" className="hover:text-white transition">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
