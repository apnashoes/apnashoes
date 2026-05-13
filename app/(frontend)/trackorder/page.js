"use client";
import { useState } from "react";
import { CheckCircle, Truck, Package, Clock } from "lucide-react";

const steps = [
  { key: "placed", label: "Order Placed", icon: Clock },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

export default function Trackorder() {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  const handleTrack = async () => {
    setError("");

    // Dummy API simulation
    if (orderId === "123" && phone === "0300") {
      setOrder({
        id: "123",
        status: "shipped",
        product: {
          name: "Running Shoes",
          size: "42",
          color: "Black",
          price: 4500,
          image: "https://via.placeholder.com/100",
        },
        courier: "Leopards",
        trackingId: "LCS123456",
        eta: "2-3 Days",
      });
    } else {
      setOrder(null);
      setError("Order not found");
    }
  };

  const getStepIndex = (status) => {
    return steps.findIndex((s) => s.key === status);
  };

  return (
    <div className="min-h-[755px] bg-gray-100 p-6 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">Track Your Order</h1>

        {/* Inputs */}
        <div className="flex flex-col gap-3">
          <input
            className="w-full border rounded-lg p-2"
            placeholder="Enter Order ID"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
          <input
            className="w-full border rounded-lg p-2"
            placeholder="Enter Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button
            onClick={handleTrack}
            className="bg-black text-white py-2 rounded-lg hover:bg-gray-800"
          >
            Track Order
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-center">{error}</p>
        )}

        {/* Order Info */}
        {order && (
          <div className="space-y-6">
            {/* Progress */}
            <div className="flex justify-between items-center">
              {steps.map((step, index) => {
                const currentIndex = getStepIndex(order.status);
                const Icon = step.icon;
                const active = index <= currentIndex;

                return (
                  <div key={step.key} className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${
                        active ? "bg-black text-white" : "bg-white"
                      }`}
                    >
                      <Icon size={18} />
                    </div>
                    <span className="text-xs mt-2 text-center">{step.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Product Details */}
            <div className="flex gap-4 items-center border p-4 rounded-lg">
              <img
                src={order.product.image}
                alt="product"
                className="w-20 h-20 rounded"
              />
              <div>
                <h2 className="font-semibold">{order.product.name}</h2>
                <p className="text-sm text-gray-500">
                  Size: {order.product.size} | Color: {order.product.color}
                </p>
                <p className="font-bold">Rs. {order.product.price}</p>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="border p-4 rounded-lg text-sm space-y-1">
              <p>
                <strong>Courier:</strong> {order.courier}
              </p>
              <p>
                <strong>Tracking ID:</strong> {order.trackingId}
              </p>
              <p>
                <strong>Estimated Delivery:</strong> {order.eta}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
