"use client";

import { useWishlist } from "../context/WishlistContext";
import Image from "next/image";
import { FiHeart, FiTrash2, FiShoppingCart } from "react-icons/fi";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Title */}
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>

      {/* Empty State */}
      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <FiHeart size={50} className="mb-4" />
          <h2 className="text-xl font-semibold">Your wishlist is empty</h2>
          <p className="text-sm mt-2">Save items you love ❤️</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((item) => (
            <div
              key={item._id}
              className="border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition duration-300 bg-white"
            >
              {/* Image */}
              <div className="relative w-full h-60 bg-gray-100">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover transition duration-300"
                />

                {/* Remove Button */}
                <button
                  onClick={() => removeFromWishlist(item._id)}
                  className="absolute top-3 right-3 bg-white p-2 rounded-full shadow hover:bg-red-100"
                >
                  <FiTrash2 className="text-red-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                <h2 className="text-sm font-semibold line-clamp-2 mb-2">
                  {item.name}
                </h2>

                <p className="text-lg font-bold text-gray-900 mb-3">
                  Rs {item.price}
                </p>

                {/* Buttons */}
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition">
                    <FiShoppingCart size={16} />
                    Add to Cart
                  </button>

                  <button
                    onClick={() => removeFromWishlist(item._id)}
                    className="p-2 border rounded-lg hover:bg-gray-100"
                  >
                    <FiHeart className="text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}