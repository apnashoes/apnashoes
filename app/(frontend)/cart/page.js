"use client";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export default function CartPage() {
  const { cart, updateQty, removeFromCart } = useCart();
  // Confirmation dialog state
  const [showConfirm, setShowConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );
  const tax = 1000;
  const grandTotal = subtotal + tax;

  // Format Pakistani Rupees: ₨1,12,198
  const formatPKR = (amount) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    })
      .format(amount)
      .replace("PKR", "₨");
  };

  // Open delete confirmation
  const confirmDelete = (item) => {
    setItemToDelete(item);
    setShowConfirm(true);
  };

  // Actually delete after confirmation
  const handleDelete = () => {
    if (itemToDelete) {
      removeFromCart(itemToDelete._id);
      setShowConfirm(false);
      setItemToDelete(null);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-32 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl mb-6 font-bold">Your Cart</h1>
          <p className="text-gray-500 text-lg">Your cart is empty</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 pt-16 pb-32">
        <div className="max-w-4xl mx-auto px-4">
          {/* Title */}
          <h1 className="text-center text-4xl font-bold mb-12">
            Your Cart ({cart.length} {cart.length === 1 ? "item" : "items"})
          </h1>

          {/* Cart Items Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Desktop Header */}
            <div className="hidden md:grid grid-cols-12 px-10 py-4 text-sm font-medium text-gray-500 border-b">
              <div className="col-span-5">Item</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            {/* Cart Items */}
            {cart.map((item, idx) => (
              <div
                key={item._id}
                className={`px-6 py-8 md:px-10 flex flex-col md:grid md:grid-cols-12 items-start md:items-center gap-6 ${
                  idx !== cart.length - 1 ? "border-b" : ""
                }`}
              >
                {/* Item Details */}
                <div className="col-span-5 flex gap-5">
                  <Image
                    src={item.images?.mainImage?.url || "/placeholder.png"}
                    width={100}
                    height={100}
                    alt={item.title}
                    className="border border-gray-300"
                  />
                  <div>
                    <h3 className="font-medium text-lg">{item.title}</h3>
                    {item.fuelSource && (
                      <p className="text-sm text-gray-600 mt-1">
                        Fuel Source: {item.fuelSource}
                      </p>
                    )}
                    {item.shippingDate && (
                      <p className="text-sm text-red-600 font-medium mt-2">
                        [Estimated Ship Date: {item.shippingDate}]
                      </p>
                    )}
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-sm text-gray-400 hover:text-black underline mt-3"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="col-span-2 text-lg font-medium text-right">
                  {formatPKR(item.price)}
                </div>

                {/* Quantity with Input Field */}
                <div className="col-span-3 flex items-center justify-center gap-3">
                  <button
                    onClick={() => updateQty(item._id, -1)}
                    className="border px-3 py-1"
                  >
                    –
                  </button>
                  <span className="px-4 py-1 border">{item.qty}</span>
                  <button
                    onClick={() => updateQty(item._id, 1)}
                    className="border px-3 py-1"
                  >
                    +
                  </button>
                </div>

                {/* Line Total + Remove */}
                <div className="col-span-2 text-right flex items-center justify-end gap-4">
                  <span className="text-lg font-medium">
                    {formatPKR(item.price * item.qty)}
                  </span>
                  {/* // Inside your cart item */}
                  <button
                    onClick={() => confirmDelete(item)}
                    className="text-gray-400 hover:text-red-600 transition-colors duration-200"
                    title="Remove from cart"
                  >
                    <Trash2 className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="mt-10 bg-white rounded-lg shadow-sm border p-8">
            <div className="space-y-4 text-lg">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">{formatPKR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Sales Tax:</span>
                <span>{formatPKR(tax)}</span>
              </div>
              <div className="flex justify-between border-t pt-4">
                <span className="text-xl font-medium">Grand total:</span>
                <span className="text-xl font-bold">
                  {formatPKR(grandTotal)}
                </span>
              </div>
            </div>

            <p className="mt-6 text-sm text-gray-600">
              Congrats, you&apos;re eligible for
              <strong className="text-black">Free Shipping</strong>
            </p>

            <Link
              href="/checkout"
              className="mt-8 block w-full bg-black text-white text-center py-4 text-lg font-medium tracking-wider hover:bg-gray-900 transition"
            >
              Check out
            </Link>

            <div className="mt-6 text-center">
              <Link href="/" className="text-sm underline text-gray-600">
                ← Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in">
            <h3 className="text-lg font-semibold mb-3">Remove Item?</h3>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to remove <strong>{itemToDelete?.title}</strong> from your cart?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}