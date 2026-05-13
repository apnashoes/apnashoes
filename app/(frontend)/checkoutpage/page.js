"use client";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shippingCost = 99;

  const [sameBilling, setSameBilling] = useState(true);
  const [discountCode, setDiscountCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  const [errors, setErrors] = useState({}); // ✅ Validation errors
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const [shipping, setShipping] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    postalCode: "",
    Shippingphone: "",
    country: "Pakistan",
  });

  const [billing, setBilling] = useState({
    billingFirstName: "",
    billingLastName: "",
    billingAddress: "",
    billingApartment: "",
    billingCity: "",
    billingPostalCode: "",
    Billingphone: "",
    countries: [
      "Afghanistan",
      "Albania",
      "Algeria",
      "Andorra",
      "Angola",
      "Argentina",
      "Armenia",
      "Australia",
      "Austria",
      "Azerbaijan",
      "Bahrain",
      "Bangladesh",
      "Belgium",
      "Bhutan",
      "Bosnia and Herzegovina",
      "Brazil",
      "Bulgaria",
      "Cambodia",
      "Cameroon",
      "Canada",
      "Chile",
      "China",
      "Colombia",
      "Croatia",
      "Cyprus",
      "Czech Republic",
      "Denmark",
      "Egypt",
      "Estonia",
      "Finland",
      "France",
      "Germany",
      "Greece",
      "Hong Kong",
      "Hungary",
      "Iceland",
      "India",
      "Indonesia",
      "Iran",
      "Iraq",
      "Ireland",
      "Israel",
      "Italy",
      "Japan",
      "Jordan",
      "Kazakhstan",
      "Kenya",
      "Kuwait",
      "Kyrgyzstan",
      "Laos",
      "Latvia",
      "Lebanon",
      "Libya",
      "Lithuania",
      "Luxembourg",
      "Malaysia",
      "Maldives",
      "Malta",
      "Mexico",
      "Moldova",
      "Monaco",
      "Mongolia",
      "Morocco",
      "Myanmar",
      "Nepal",
      "Netherlands",
      "New Zealand",
      "Nigeria",
      "North Korea",
      "Norway",
      "Oman",
      "Pakistan",
      "Palestine",
      "Peru",
      "Philippines",
      "Poland",
      "Portugal",
      "Qatar",
      "Romania",
      "Russia",
      "Saudi Arabia",
      "Serbia",
      "Singapore",
      "Slovakia",
      "Slovenia",
      "South Africa",
      "South Korea",
      "Spain",
      "Sri Lanka",
      "Sudan",
      "Sweden",
      "Switzerland",
      "Syria",
      "Taiwan",
      "Tajikistan",
      "Thailand",
      "Tunisia",
      "Turkey",
      "Turkmenistan",
      "Ukraine",
      "United Arab Emirates",
      "United Kingdom",
      "United States",
      "Uzbekistan",
      "Vietnam",
      "Yemen",
    ],
  });

  // Prefill from localStorage on mount
  useEffect(() => {
    const savedShipping = localStorage.getItem("shipping");
    const savedBilling = localStorage.getItem("billing");

    if (savedShipping)
      setShipping((prev) => ({ ...prev, ...JSON.parse(savedShipping) }));
    if (savedBilling)
      setBilling((prev) => ({ ...prev, ...JSON.parse(savedBilling) }));
  }, []);

  // Save only non-empty shipping fields to localStorage
  useEffect(() => {
    const nonEmptyShipping = {};
    Object.keys(shipping).forEach((key) => {
      const value = shipping[key];
      if (typeof value === "string" && value.trim() !== "") {
        nonEmptyShipping[key] = value;
      } else if (typeof value !== "string" && value != null) {
        nonEmptyShipping[key] = value; // keep arrays or objects as is
      }
    });
    localStorage.setItem("shipping", JSON.stringify(nonEmptyShipping));
  }, [shipping]);

  // Save only non-empty billing fields to localStorage
  useEffect(() => {
    const nonEmptyBilling = {};
    Object.keys(billing).forEach((key) => {
      const value = billing[key];
      if (typeof value === "string" && value.trim() !== "") {
        nonEmptyBilling[key] = value;
      } else if (typeof value !== "string" && value != null) {
        nonEmptyBilling[key] = value;
      }
    });
    localStorage.setItem("billing", JSON.stringify(nonEmptyBilling));
  }, [billing]);

  // useEffect(() => {
  //   // If cart is empty → redirect to cart page
  //   if (cart.length === 0) {
  //     router.replace("/");
  //   }
  // }, [cart, router]);

  // ✅ Helper validation function
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^((\+92)|0)?3[0-9]{9}$/; // Pakistani number validation (03xxxxxxxxx or +923xxxxxxxxx)
  const textRegex = /^[a-zA-Z\s]+$/;
  const postalRegex = /^[0-9]+$/;

  // ✅ Field-specific validation (runs live)
  const validateField = (name, value) => {
    switch (name) {
      case "email":
        if (!value.trim()) return "Email is required";
        if (!emailRegex.test(value)) return "Enter a valid email address";
        break;
      case "firstName":
        if (!value.trim()) return "First name is required";
        if (!textRegex.test(value)) return "Only alphabets allowed";
        break;
      case "billingFirstName":
        if (!value.trim()) return "First name is required";
        if (!textRegex.test(value)) return "Only alphabets allowed";
        break;
      case "lastName":
        if (!value.trim()) return "Last name is required";
        if (!textRegex.test(value)) return "Only alphabets allowed";
        break;
      case "billingLastName":
        if (!value.trim()) return "Last name is required";
        if (!textRegex.test(value)) return "Only alphabets allowed";
        break;
      case "address":
        if (!value.trim()) return "Address is required";
        break;
      case "billingAddress":
        if (!value.trim()) return "Address is required";
        break;
      case "city":
        if (!value.trim()) return "City is required";
        if (!textRegex.test(value))
          return "City name should only contain alphabets";
        break;
      case "billingCity":
        if (!value.trim()) return "City is required";
        if (!textRegex.test(value))
          return "City name should only contain alphabets";
        break;
      case "Shippingphone":
        if (!value.trim()) return "Phone number is required";
        if (!phoneRegex.test(value))
          return "Enter a valid Pakistani phone number (03xxxxxxxxx)";
        break;
      case "Billingphone":
        if (!value.trim()) return "Phone number is required";
        if (!phoneRegex.test(value))
          return "Enter a valid Pakistani phone number (03xxxxxxxxx)";
        break;
      case "apartment":
      case "billingApartment":
        if (value && value.length > 50)
          return "Apartment field max 50 characters";
        break;
      case "postalCode":
      case "billingPostalCode":
        if (value && !postalRegex.test(value))
          return "Postal code must be numeric";
        break;
      default:
        return "";
    }
    return "";
  };
  // ✅ Handle live change for both shipping and billing

  // ✅ Validate all fields on submit
  const validateForm = () => {
    const newErrors = {};
    Object.keys(shipping).forEach((key) => {
      const msg = validateField(key, shipping[key]);
      if (msg) newErrors[key] = msg;
    });
    if (!sameBilling) {
      Object.keys(billing).forEach((key) => {
        const msg = validateField(key, billing[key]);
        if (msg) newErrors[key] = msg;
      });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Handle live change
  const handleChange = (e, type = "shipping") => {
    const { name, value } = e.target;
    if (type === "shipping") {
      setShipping((prev) => ({ ...prev, [name]: value }));
      const msg = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: msg }));
    } else {
      setBilling((prev) => ({ ...prev, [name]: value }));
      const msg = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: msg }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return alert("Please fix highlighted errors first.");

    setLoading(true);

    const orderData = {
      customer: shipping,
      billing: sameBilling ? shipping : billing,
      items: cart,
      total: total + shippingCost,
      discountCode,
      paymentMethod: "cod", // ✅ lowercase
    };

    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      const data = await res.json();
      console.log("🧾 Order Response:", res.status, data); // 👈 Add this line

      if (res.ok && data.success) {
        alert("✅ Order placed successfully!");
        clearCart();

        // ✅ Redirect to dynamic confirmation page using the new order ID
        router.push(`/order-confirmation/${data.order._id}`);
      } else {
        console.error("Order Error Details:", data);
        alert("❌ Something went wrong while placing your order.");
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert("❌ Error placing order.");
    } finally {
      setLoading(false);
    }
  };

  // Format price in Pakistani currency style (with commas and decimals)
  const formatPKR = (amount) =>
    amount?.toLocaleString("en-PK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* HEADER */}
      {/* <div className="flex justify-center py-4 border-b">
        <Link href="/">
          <img src="/logo.png" alt="Brand" className="h-16" />
        </Link>
      </div> */}

      {/* HEADER */}
      <div className="w-full border-b py-4 px-4 md:px-8 relative flex items-center justify-between">
        {/* Title - Always centered */}
        <Link href="/">
          <h1 className="text-lg font-medium">Apna Shoes</h1>
        </Link>

        {/* Cart Icon - Right */}
        <Link
          href="/cart"
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-handbag"
          >
            <path d="M2.048 18.566A2 2 0 0 0 4 21h16a2 2 0 0 0 1.952-2.434l-2-9A2 2 0 0 0 18 8H6a2 2 0 0 0-1.952 1.566z" />
            <path d="M8 11V6a4 4 0 0 1 8 0v5" />
          </svg>
        </Link>
      </div>

      {/* MOBILE ORDER SUMMARY TOGGLE */}
      <div className="md:hidden sticky top-0 z-30 bg-gray-50 border-b">
        {/* Toggle Header */}
        <button
          type="button"
          onClick={() => setShowMobileSummary(!showMobileSummary)}
          className="w-full flex justify-between items-center p-4 font-medium text-gray-800"
        >
          <div className="flex items-center gap-2">
            <span>Order summary</span>
            <svg
              className={`w-4 h-4 transform transition-transform duration-300 ${
                showMobileSummary ? "rotate-180" : "rotate-0"
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
          <span className="text-gray-900 font-semibold">
            <span>
              <span className="text-gray-400 text-xs">PKR</span> Rs{" "}
              {formatPKR(total + shippingCost)}
            </span>
          </span>
        </button>

        {/* Animated Dropdown */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            showMobileSummary
              ? "max-h-[1000px] opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-gray-50 px-4 pb-4 space-y-4 pt-2 border-t">
            {cart.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b pb-2"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={item.images?.main?.url || "/placeholder.png"}
                      alt={item.title}
                      className="h-16 w-16 object-cover rounded-md border"
                    />
                    <span className="absolute -top-1 -right-1 bg-gray-800 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {item.qty}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {item.title}
                    </p>
                    {item.size && (
                      <p className="text-xs text-gray-500">{item.size}</p>
                    )}
                  </div>
                </div>
                <p className="text-sm font-semibold">
                  Rs {formatPKR(item.price * item.qty)}
                </p>
              </div>
            ))}

            {/* Totals */}
            <div className="text-sm border-t pt-3 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rs {formatPKR(total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Rs {formatPKR(shippingCost)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total</span>
                <span>
                  <span className="text-gray-400 text-xs">PKR</span> Rs{" "}
                  {formatPKR(total + shippingCost)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_500px]">
        {/* LEFT SIDE */}
        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">
          {/* Contact */}
          <div>
            <h2 className="font-semibold text-lg mb-2">Contact</h2>
            <input
              name="email"
              type="email"
              value={shipping.email}
              onChange={handleChange}
              placeholder="Email"
              className={`w-full border rounded-md px-4 py-2 focus:ring-2 ${
                errors.email
                  ? "border-red-500 ring-red-300"
                  : "focus:ring-indigo-500"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Delivery */}
          <div>
            <h2 className="font-semibold text-lg mb-2">Delivery</h2>
            <select
              name="country"
              value={shipping.country}
              onChange={handleChange}
              className="w-full border rounded-md px-4 py-2 mb-3"
            >
              <option value="Pakistan">Pakistan</option>
            </select>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  name="firstName"
                  placeholder="First name"
                  value={shipping.firstName}
                  onChange={handleChange}
                  className={`border rounded-md px-4 py-2 w-full ${
                    errors.firstName
                      ? "border-red-500 ring-red-300"
                      : "focus:ring-indigo-500"
                  }`}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div>
                <input
                  name="lastName"
                  placeholder="Last name"
                  value={shipping.lastName}
                  onChange={handleChange}
                  className={`border rounded-md px-4 py-2 w-full ${
                    errors.lastName
                      ? "border-red-500 ring-red-300"
                      : "focus:ring-indigo-500"
                  }`}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>
            <div className="mt-3">
              <input
                name="address"
                placeholder="Address"
                value={shipping.address}
                onChange={handleChange}
                className={`border rounded-md px-4 py-2 w-full ${
                  errors.address
                    ? "border-red-500 ring-red-300"
                    : "focus:ring-indigo-500"
                }`}
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
              )}
            </div>
            <input
              name="apartment"
              placeholder="Apartment, suite, etc. (optional)"
              value={shipping.apartment}
              onChange={handleChange}
              className={`border rounded-md px-4 py-2 w-full mt-3 ${
                errors.apartment
                  ? "border-red-500 ring-red-300"
                  : "focus:ring-indigo-500"
              }`}
            />
            {errors.apartment && (
              <p className="text-red-500 text-sm mt-1">{errors.apartment}</p>
            )}

            <div className="grid grid-cols-2 gap-3 mt-3">
              <input
                name="city"
                placeholder="City"
                value={shipping.city}
                onChange={handleChange}
                className={`border rounded-md px-4 py-2 w-full ${
                  errors.city
                    ? "border-red-500 ring-red-300"
                    : "focus:ring-indigo-500"
                }`}
              />
              <input
                name="postalCode"
                placeholder="Postal code (optional)"
                value={shipping.postalCode}
                onChange={handleChange}
                className={`border rounded-md px-4 py-2 w-full ${
                  errors.postalCode
                    ? "border-red-500 ring-red-300"
                    : "focus:ring-indigo-500"
                }`}
              />
              {errors.postalCode && (
                <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>
              )}
            </div>
            <div className="mt-3">
              <input
                name="Shippingphone"
                placeholder="Phone"
                value={shipping.Shippingphone}
                onChange={handleChange}
                className={`border rounded-md px-4 py-2 w-full ${
                  errors.Shippingphone ? "border-red-500" : ""
                }`}
              />
              {errors.Shippingphone && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.Shippingphone}
                </p>
              )}
            </div>
          </div>

          {/* Shipping Method */}
          <div>
            <h2 className="font-semibold text-lg mb-2">Shipping method</h2>
            <div className="flex justify-between bg-black/5 border rounded-md px-4 py-3 border-black">
              <span>Shipping Charges</span>
              <span>Rs {shippingCost}</span>
            </div>
          </div>

          {/* Payment */}
          <div className="mt-6">
            <h2 className="font-semibold text-lg mb-2">Payment</h2>

            <p className="text-sm text-gray-500 mb-4">
              🔒 Secure & encrypted payments
            </p>

            <div className="space-y-3">
              {/* COD */}
              <label
                className={`flex items-start gap-3 border rounded-lg p-4 cursor-pointer transition-all
      ${paymentMethod === "cod" ? "border-black bg-gray-50 shadow-sm" : "hover:border-gray-400"}
    `}
              >
                <input
                  type="radio"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="mt-1"
                />

                <div>
                  <p className="font-medium">Cash on Delivery (COD)</p>
                  <p className="text-sm text-gray-500">
                    Pay when you receive your order
                  </p>
                </div>
              </label>

              {/* JazzCash */}
              <label
                className={`flex items-start gap-3 border rounded-lg p-4 cursor-pointer transition-all
      ${paymentMethod === "jazzcash" ? "border-black bg-gray-50 shadow-sm" : "hover:border-gray-400"}
    `}
              >
                <input
                  type="radio"
                  checked={paymentMethod === "jazzcash"}
                  onChange={() => setPaymentMethod("jazzcash")}
                  className="mt-1"
                />

                <div className="w-full">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">JazzCash</p>
                    <span className="text-xs text-green-600 font-medium">
                      Save Rs. 200
                    </span>
                  </div>

                  {paymentMethod === "jazzcash" && (
                    <div className="mt-3">
                      <input
                        type="text"
                        placeholder="Enter JazzCash Number"
                        className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-black"
                      />
                    </div>
                  )}
                </div>
              </label>

              {/* Easypaisa */}
              <label
                className={`flex items-start gap-3 border rounded-lg p-4 cursor-pointer transition-all
      ${paymentMethod === "easypaisa" ? "border-black bg-gray-50 shadow-sm" : "hover:border-gray-400"}
    `}
              >
                <input
                  type="radio"
                  checked={paymentMethod === "easypaisa"}
                  onChange={() => setPaymentMethod("easypaisa")}
                  className="mt-1"
                />

                <div className="w-full">
                  <p className="font-medium">Easypaisa</p>

                  {paymentMethod === "easypaisa" && (
                    <div className="mt-3">
                      <input
                        type="text"
                        placeholder="Enter Easypaisa Number"
                        className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-black"
                      />
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Billing Address Toggle */}
          <div>
            <h2 className="font-semibold text-lg mb-2">Billing address</h2>
            <div className="border rounded-t divide-y">
              <label className="flex items-center gap-2 p-3 cursor-pointer">
                <input
                  type="radio"
                  checked={sameBilling}
                  onChange={() => setSameBilling(true)}
                />
                <span>Same as shipping address</span>
              </label>
              <label className="flex items-center gap-2 p-3 cursor-pointer">
                <input
                  type="radio"
                  checked={!sameBilling}
                  onChange={() => setSameBilling(false)}
                />
                <span>Use a different billing address</span>
              </label>
            </div>

            {/* Billing Form */}
            {!sameBilling && (
              <div className="border p-4 space-y-3 bg-gray-50 rounded-b-md">
                <select
                  name="country"
                  value={billing.countries}
                  onChange={(e) => handleChange(e, "billing")}
                  className="w-full border rounded-md px-4 py-2"
                >
                  <option value="Pakistan">Pakistan</option>
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      name="billingFirstName"
                      placeholder="Billing First name"
                      value={billing.firstName}
                      onChange={(e) => handleChange(e, "billing")}
                      className={`border rounded-md px-4 py-2 w-full ${
                        errors.billingFirstName ? "border-red-500" : ""
                      }`}
                    />
                    {errors.billingFirstName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.billingFirstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      name="billingLastName"
                      placeholder="Billing Last name"
                      value={billing.lastName}
                      onChange={(e) => handleChange(e, "billing")}
                      className={`border rounded-md px-4 py-2 w-full ${
                        errors.billingLastName ? "border-red-500" : ""
                      }`}
                    />
                    {errors.billingLastName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.billingLastName}
                      </p>
                    )}
                  </div>
                </div>
                <input
                  name="billingAddress"
                  placeholder="Billing Address"
                  value={billing.billingAddress}
                  onChange={(e) => handleChange(e, "billing")}
                  className={`border rounded-md px-4 py-2 w-full ${
                    errors.billingAddress
                      ? "border-red-500 ring-red-300"
                      : "focus:ring-indigo-500"
                  }`}
                />
                {errors.billingAddress && (
                  <p className="text-red-500 text-sm">
                    {errors.billingAddress}
                  </p>
                )}
                <input
                  name="billingApartment"
                  placeholder="Apartment, suite, etc. (optional)"
                  value={billing.billingApartment}
                  onChange={(e) => handleChange(e, "billing")}
                  className={`border rounded-md px-4 py-2 w-full ${
                    errors.billingApartment
                      ? "border-red-500 ring-red-300"
                      : "focus:ring-indigo-500"
                  }`}
                />
                {errors.billingApartment && (
                  <p className="text-red-500 text-sm">
                    {errors.billingApartment}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <input
                    name="billingCity"
                    placeholder="City"
                    value={billing.billingCity}
                    onChange={(e) => handleChange(e, "billing")}
                    className={`border rounded-md px-4 py-2 w-full ${
                      errors.billingCity
                        ? "border-red-500 ring-red-300"
                        : "focus:ring-indigo-500"
                    }`}
                  />
                  {errors.billingCity && (
                    <p className="text-red-500 text-sm">{errors.billingCity}</p>
                  )}

                  <input
                    name="billingPostalCode"
                    placeholder="Postal code (optional)"
                    value={billing.billingPostalCode}
                    onChange={(e) => handleChange(e, "billing")}
                    className={`border rounded-md px-4 py-2 w-full ${
                      errors.billingPostalCode
                        ? "border-red-500 ring-red-300"
                        : "focus:ring-indigo-500"
                    }`}
                  />
                  {errors.billingPostalCode && (
                    <p className="text-red-500 text-sm">
                      {errors.billingPostalCode}
                    </p>
                  )}
                </div>
                <div className="mt-3">
                  <input
                    name="Billingphone"
                    placeholder="Phone"
                    value={shipping.Billingphone}
                    onChange={handleChange}
                    className={`border rounded-md px-4 py-2 w-full ${
                      errors.Billingphone
                        ? "border-red-500 ring-red-300"
                        : "focus:ring-indigo-500"
                    }`}
                  />
                  {errors.Billingphone && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.Billingphone}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Complete Order Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-md mt-6 hover:bg-gray-900 transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Complete order"}
          </button>

          {/* Footer */}
          <div className="hidden md:inline-block bg-white z-40 mt-auto text-center text-sm text-gray-500 space-x-4">
            <Link href="#" className="hover:underline">
              Refund policy
            </Link>
            <Link href="#" className="hover:underline">
              Shipping
            </Link>
            <Link href="#" className="hover:underline">
              Privacy policy
            </Link>
            <Link href="#" className="hover:underline">
              Terms of service
            </Link>
            <Link href="#" className="hover:underline">
              Contact
            </Link>
          </div>
        </form>

        {/* RIGHT SIDE (Sticky) */}
        <div className="bg-gray-50 border-l px-6 py-8 md:px-8 lg:sticky lg:top-0 lg:max-h-screen overflow-y-auto">
          <div className="md:hidden">
            <h2 className="mb-4 text-xl font-semibold">Order summary</h2>
          </div>
          {cart.length > 0 ? (
            <div className="space-y-6 mb-6">
              {cart.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  {/* Product Image + Info */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="h-20 w-20 relative">
                        <Image
                          src={item.images?.main?.url || "/placeholder.png"}
                          alt={item.title}
                          fill
                          className="object-cover rounded-md border"
                        />
                      </div>

                      {/* Quantity Badge */}
                      <span className="absolute -top-2 -right-2 bg-gray-800 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                        {item.qty}
                      </span>
                    </div>

                    <div>
                      <p className="font-medium text-sm text-gray-800">
                        {item.title}
                      </p>
                      {item.size && (
                        <p className="text-gray-500 text-xs mt-0.5">
                          {item.size}
                        </p>
                      )}

                      {/* Color & Size */}
                      {item.selectedColor && (
                        <p className="text-xs text-gray-500">
                          Color:{" "}
                          <span className="font-medium">
                            {item.selectedColor?.name}
                          </span>
                        </p>
                      )}
                      {item.selectedSize && (
                        <p className="text-xs text-gray-500">
                          Size:{" "}
                          <span className="font-medium">
                            {item.selectedSize}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Product Price */}
                  <p className="font-semibold text-sm text-gray-800">
                    Rs {formatPKR(item.price * item.qty)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Your cart is empty.</p>
          )}

          {/* Totals */}
          <div className="text-sm border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>Rs {formatPKR(total)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Rs {formatPKR(shippingCost)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-3">
              <span>Total</span>
              <span>
                <span className="text-gray-400 text-xs">PKR</span> Rs{" "}
                {formatPKR(total + shippingCost)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="md:hidden lg:hidden sm:inline-block bg-white pt-6 z-40 mt-auto text-center text-sm text-gray-500 space-x-4">
          <Link href="#" className="hover:underline">
            Refund policy
          </Link>
          <Link href="#" className="hover:underline">
            Shipping
          </Link>
          <Link href="#" className="hover:underline">
            Privacy policy
          </Link>
          <Link href="#" className="hover:underline">
            Terms of service
          </Link>
          <Link href="#" className="hover:underline">
            Contact
          </Link>
        </div>
      </div>
    </div>
  );
}
