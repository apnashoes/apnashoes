// // components/Header.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { useWishlist } from "../app/(frontend)/context/WishlistContext"; // adjust path
import {
  FiMenu,
  FiX,
  FiShoppingCart,
  FiSearch,
  FiTrash2,
  FiUser,
  FiHeart,
} from "react-icons/fi";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "../app/(frontend)/context/CartContext";

export default function Header() {
  const { wishlist } = useWishlist();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // const [isCartOpen, setIsCartOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const { data: session, status } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const inputRef = useRef(null); // ✅ JS version

  // ✅ Use global cart from context
  const {
    cart,
    addToCart,
    removeFromCart,
    updateQty,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  // Calculate subtotal
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  // Fetch suggestions
  useEffect(() => {
    if (!query.trim()) return setSuggestions([]);

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${query.trim()}`);
        const data = await res.json();
        setSuggestions(data);
        setActiveIndex(-1);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300); // debounce

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!suggestions.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0) {
        const selected = suggestions[activeIndex];
        window.location.href = `/product/${selected._id}`;
        setShowSearch(false);
        setQuery("");
      }
    } else if (e.key === "Escape") {
      setShowSearch(false);
      setQuery("");
    }
  };

  // Menu Links
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Adidas", href: "/category/adidas" },
    { name: "Formal", href: "/category/formal" },
    { name: "Shop", href: "/category/shop" },
    { name: "Sneakers", href: "/category/sneakers" },
    { name: "Skechers", href: "/category/skechers" },
    { name: "Nike", href: "/category/nike" },
    { name: "Men", href: "/category/men" },
    { name: "Women", href: "/category/women" },
    { name: "New Arrivals", href: "newarrival" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* ================== Top Row ================== */}
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Left: Search Button */}
        <button
          onClick={() => {
            setShowSearch(true);
            setTimeout(() => inputRef.current?.focus(), 100);
          }}
          className="text-xl text-gray-700"
        >
          <FiSearch />
        </button>

        {/* Center: Logo */}
        <Link href="/" className="text-2xl font-bold tracking-widest">
          <Image src="/logo.png" width={120} height={80} alt="logo" />
        </Link>

        {/* Right: Icons */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            {status === "loading" ? (
              <div className="w-6 h-6 bg-gray-300 rounded-full animate-pulse" />
            ) : !session ? (
              <Link href="/login" className="text-xl">
                <FiUser />
              </Link>
            ) : (
              <>
                {/* User Avatar */}
                <button
                  onClick={() => setShowUserMenu((prev) => !prev)}
                  className="flex items-center gap-2"
                >
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt="user"
                      className="w-8 h-8 rounded-full border"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-full text-sm">
                      {session.user?.name?.charAt(0)}
                    </div>
                  )}
                </button>

                {/* Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-48 bg-white border rounded-lg shadow-lg z-50">
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-semibold">
                        {session.user?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {session.user?.email}
                      </p>
                    </div>

                    <Link
                      href="/profile"
                      className="block px-4 py-2 hover:bg-gray-100 text-sm"
                      onClick={() => setShowUserMenu(false)}
                    >
                      My Profile
                    </Link>

                    <Link
                      href="/orders"
                      className="block px-4 py-2 hover:bg-gray-100 text-sm"
                      onClick={() => setShowUserMenu(false)}
                    >
                      My Orders
                    </Link>

                    <button
                      onClick={() => signOut()}
                      className="w-full text-left px-4 py-2 hover:bg-red-100 text-red-500 text-sm"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          <Link href="/wishlist" className="relative">
            <FiHeart size={24} />

            {wishlist.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full">
                {wishlist.length}
              </span>
            )}
          </Link>
          <button
            onClick={() => setIsCartOpen(true)}
            className="text-xl cursor-pointer relative"
          >
            <FiShoppingCart />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setIsMenuOpen(true)}
            className="text-2xl md:hidden"
          >
            <FiMenu />
          </button>
        </div>
      </div>

      {/* ================== Bottom Row (Menu) ================== */}
      <nav className="bg-gray-100 border-t border-gray-200 sticky top-[60px] z-40">
        <ul className="hidden md:flex justify-center flex-wrap gap-6 py-3 text-sm font-medium text-gray-700">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link href={link.href} className="hover:text-black transition">
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* ================== Left Drawer (Mobile Menu) ================== */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Drawer Panel */}
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="fixed top-0 left-0 w-96 h-full bg-white text-black z-50 flex flex-col shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="flex justify-end items-center px-6 py-5 border-b border-gray-800">
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="text-2xl text-gray-600 hover:text-black transition"
                >
                  <FiX />
                </button>
              </div>

              {/* Drawer Menu */}
              <motion.ul
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
                className="flex-1 overflow-y-auto p-6 space-y-4"
              >
                {navLinks.map((link) => (
                  <motion.li
                    key={link.name}
                    variants={{
                      hidden: { opacity: 0, x: -30 },
                      visible: { opacity: 1, x: 0 },
                    }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="group flex items-center space-x-3 text-lg font-medium tracking-wide hover:text-gray-600 transition"
                    >
                      <span className="w-2 h-2 bg-black rounded-full transform scale-0 group-hover:scale-100 transition" />
                      <span className="relative">
                        {link.name}
                        <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gray-600 group-hover:w-full transition-all duration-300" />
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>

              {/* Drawer Footer */}
              <div className="px-6 py-5 border-t border-gray-800 text-sm text-gray-500">
                © 2025 <span className="text-white font-semibold">TimeTex</span>
                . All rights reserved.
              </div>
            </motion.div>

            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black backdrop-blur-sm z-40"
              onClick={() => setIsMenuOpen(false)}
            />
          </>
        )}
      </AnimatePresence>

      {/* ================== Right Drawer (Cart) ================== */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Drawer Panel */}
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="fixed top-0 right-0 w-96 h-full bg-white text-black z-50 flex flex-col shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="flex justify-between items-center px-6 py-5 border-b border-gray-800">
                <h2 className="text-lg font-semibold tracking-wide">
                  Your Cart
                </h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-2xl text-gray-400 hover:text-black transition"
                >
                  <FiX />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="flex justify-center items-center text-gray-400 text-2xl mb-6">
                      🛒 Your cart is empty.
                    </p>
                    <Link
                      href="/"
                      className="inline-block bg-black text-white px-6 py-3 hover:bg-black/85 transition font-medium"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                ) : (
                  cart.map((item) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex gap-4 border-b border-gray-200 pb-4"
                    >
                      <div className="flex gap-4 border-b border-gray-200 last:border-b-0">
                        {/* Product Image - Accessible */}
                        <div className="flex-shrink-0">
                          <Image
                            src={item.images?.main?.url || "/placeholder.png"}
                            alt={item.title} // Critical for screen readers
                            width={80}
                            height={80}
                            className="w-20 h-20 object-cover border border-gray-200"
                          />
                        </div>

                        {/* Text Content - Fully Accessible */}
                        <div className="flex-1 min-w-0">
                          {/* Product Title */}
                          <h3 className="text-[18px] font-semibold text-gray-900 line-clamp-2 leading-tight">
                            {item.title}
                          </h3>

                          {/* Color & Size - Visually hidden labels for screen readers */}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {item.selectedColor && (
                              <span
                                aria-label={`Color: ${item.selectedColor.name}`}
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full"
                              >
                                {/* <span
                                  className="w-3 h-3 rounded-full border border-gray-400 inline-block"
                                  style={{
                                    backgroundColor:
                                      item.selectedColor.hex || "#ccc",
                                  }}
                                  aria-hidden="true"
                                /> */}
                                {/* <span className="sr-only">Color:</span> */}
                                {/* sr-only = screen reader only */}
                                Color:{" "}
                                <strong className="font-bold">
                                  {" "}
                                  {item.selectedColor.name}{" "}
                                </strong>
                              </span>
                            )}

                            {item.selectedSize && (
                              <span
                                aria-label={`Size: ${item.selectedSize}`}
                                className="inline-flex items-center text-xs font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full"
                              >
                                {/* <span className="sr-only">Size: {item.selectedSize}</span> */}
                                <span className="">
                                  Size:{" "}
                                  <strong className="font-bold">
                                    {item.selectedSize}
                                  </strong>
                                </span>
                              </span>
                            )}
                          </div>

                          {/* Price - Announced properly */}
                          <div className="mt-2">
                            <span
                              className="text-lg font-bold text-red-600"
                              aria-label={`Price: ${item.price.toLocaleString()} rupees`}
                            >
                              Rs {item.price.toLocaleString()}
                            </span>
                          </div>

                          {/* Quantity Controls + Remove - Fully Accessible */}
                          <div className="flex items-center justify-between mt-2">
                            {/* Quantity Group - Proper ARIA live region */}
                            <div
                              role="group"
                              aria-label={`Quantity for ${item.title}, currently ${item.qty}`}
                              className="flex items-center bg-gray-100 rounded-lg overflow-hidden"
                            >
                              <button
                                onClick={() => updateQty(item._id, -1)}
                                disabled={item.qty <= 1}
                                aria-label="Decrease quantity"
                                className={`w-10 h-10 flex items-center justify-center transition ${
                                  item.qty <= 1
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                                }`}
                              >
                                <span aria-hidden="true">−</span>
                              </button>

                              <span
                                className="w-12 text-center font-semibold text-gray-800"
                                aria-live="polite"
                                aria-atomic="true"
                              >
                                {item.qty}
                              </span>

                              <button
                                onClick={() => updateQty(item._id, 1)}
                                aria-label="Increase quantity"
                                className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition"
                              >
                                <span aria-hidden="true">+</span>
                              </button>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => removeFromCart(item._id)}
                              aria-label={`Remove ${item.title} from cart`}
                              className="ml-4 text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                            >
                              <FiTrash2 size={19} aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Drawer Footer */}
              {cart.length > 0 && (
                <div className="px-6 py-5 border-t border-gray-800">
                  <div className="flex justify-between font-semibold mb-8">
                    <span className="text-2xl">Subtotal</span>
                    <span className="text-2xl">
                      Rs {subtotal.toLocaleString()}
                    </span>
                  </div>
                  <Link href="/checkoutpage">
                    <button className="w-full bg-black text-white py-4 font-medium hover:bg-black/90 transition cursor-pointer">
                      Checkout
                    </button>
                  </Link>
                </div>
              )}
            </motion.div>

            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black backdrop-blur-sm z-40"
              onClick={() => setIsCartOpen(false)}
            />
          </>
        )}
      </AnimatePresence>

      {/* ================== Search Overlay ================== */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="absolute top-0 left-0 w-full bg-white shadow-md z-50"
          >
            <div className="max-w-7xl mx-auto flex items-center px-6 py-3 relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search products..."
                autoFocus
                className="w-full border-b border-gray-300 px-3 py-2 text-gray-800 focus:outline-none"
              />
              <button
                onClick={() => {
                  setShowSearch(false);
                  setQuery("");
                }}
                className="ml-3 text-2xl text-gray-600 hover:text-black"
              >
                <FiX />
              </button>

              {/* Updated Professional Search Dropdown */}
              {query && (
                <div className="absolute top-full left-0 w-full bg-white shadow-lg border border-gray-200 mt-2 rounded-md z-50 max-h-80 overflow-y-auto">
                  {loading ? (
                    <p className="p-4 text-gray-500">Loading...</p>
                  ) : suggestions.length > 0 ? (
                    suggestions.map((item, idx) => (
                      <Link
                        key={item._id}
                        href={`/products/${item.slug}`}
                        className={`flex items-center gap-4 p-3 hover:bg-gray-100 transition border-b ${
                          idx === activeIndex ? "bg-gray-200" : ""
                        }`}
                        onClick={() => {
                          setShowSearch(false);
                          setQuery("");
                        }}
                      >
                        <img
                          src={item.images?.main?.url}
                          alt={item.title}
                          className="w-18 h-18 object-cover rounded-md border"
                        />

                        <div className="flex flex-col">
                          <span className="text-gray-800 font-medium">
                            {item.title}
                          </span>
                          <span className="text-red-600 font-semibold">
                            Rs. {item.price}
                          </span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="p-4 text-gray-500">No products found.</p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
