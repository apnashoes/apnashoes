"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";

/* Skeleton Loader */
function SkeletonCard() {
  return (
    <div className="border rounded-lg p-4 bg-white animate-pulse h-[300px] flex flex-col">
      <div className="bg-gray-200 w-full h-48 mb-2 rounded"></div>
      <div className="bg-gray-200 h-4 w-3/4 mb-1 rounded"></div>
      <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
    </div>
  );
}

export default function RecommendedProducts({ productId }) {
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommended = async () => {
      setLoading(true);
      try {
        let rec = [];

        // 1️⃣ Category-based
        if (productId) {
          const res = await fetch(`/api/recommended/${productId}`);
          const data = await res.json();
          rec = data.recommended || [];
        }

        // 2️⃣ Recently viewed
        const recent = JSON.parse(localStorage.getItem("recentViewed")) || [];
        const filteredRecent = recent.filter((p) => p._id !== productId).slice(-4);

        // Merge and deduplicate by _id
        const merged = [...rec, ...filteredRecent];
        const unique = merged.filter(
          (v, i, a) => a.findIndex((p) => p._id === v._id) === i
        );

        setRecommended(unique.slice(0, 12)); // max 12 products
      } catch (err) {
        console.error("Failed to fetch recommended products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommended();
  }, [productId]);

  if (loading) {
    return (
      <section className="mt-14">
        <h2 className="text-4xl text-center font-semibold mb-6 capitalize">Customers also bought</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      </section>
    );
  }

  if (!recommended || recommended.length === 0) return null;

  return (
    <section className="mt-14">
      <h2 className="text-4xl text-center font-semibold mb-6 capitalize">Customers also bought</h2>
      <Swiper
        modules={[Navigation]}
        navigation
        spaceBetween={16}
        slidesPerView={2}
        breakpoints={{
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
        }}
      >
        {recommended.map((product) => {
          const totalStock =
            product.variants?.reduce(
              (sum, v) =>
                sum +
                (v.sizes?.reduce((s, size) => s + (size.stock || 0), 0) || 0),
              0
            ) || 0;

          const inStock = totalStock > 0;

          const discount =
            product.oldPrice && product.oldPrice > product.price
              ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
              : null;

          const daysOld = (Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24);
          const isNewArrival = daysOld <= 30;

          let badgeColor = "bg-red-600";
          if (discount > 40 && discount <= 70) badgeColor = "bg-orange-500";
          else if (discount > 70) badgeColor = "bg-green-600";

          const cardContent = (
            <div
              key={product._id}
              className={`group relative bg-white shadow-md transition-all duration-500 overflow-hidden border border-gray-100 ${
                !inStock ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:shadow-lg"
              }`}
            >
              {/* Badges */}
              {!inStock ? (
                <span className="absolute top-0 left-0 z-10 bg-gray-700 text-white text-xs font-semibold px-2 py-1 shadow">
                  Out of Stock
                </span>
              ) : (
                <>
                  {discount && (
                    <span
                      className={`absolute top-0 left-0 z-10 ${badgeColor} text-white text-xs font-semibold px-2 py-1 shadow`}
                    >
                      {discount}% OFF
                    </span>
                  )}
                  {isNewArrival && (
                    <span className="absolute top-0 right-0 z-10 bg-black text-white text-xs font-semibold px-2 py-1 shadow">
                      New Arrival
                    </span>
                  )}
                </>
              )}

              {/* Image Section */}
              <div className="relative w-full bg-gray-100 overflow-hidden">
                <div className="relative overflow-hidden group">
                  <Image
                    src={product.images?.main?.url || "/placeholder.png"}
                    alt={product.title}
                    width={400}
                    height={500}
                    className={`w-full object-cover transition-opacity duration-700 ease-in-out group-hover:opacity-0`}
                    loading="lazy"
                  />
                  {inStock && product.images?.gallery?.[0]?.url && (
                    <Image
                      src={product.images.gallery[0].url}
                      alt={`${product.title} hover`}
                      width={400}
                      height={500}
                      className="absolute top-0 left-0 w-full object-cover transition-opacity duration-1000 ease-in-out opacity-0 group-hover:opacity-100"
                      loading="lazy"
                    />
                  )}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4 text-center">
                {product.category && (
                  <span
                    className={`inline-block text-xs font-medium px-2 py-1 mb-2 ${
                      product.category === "Wash & Wear"
                        ? "bg-blue-100 text-blue-800"
                        : product.category === "Cotton"
                        ? "bg-green-100 text-green-800"
                        : product.category === "Summer Collection"
                        ? "bg-yellow-100 text-yellow-800"
                        : product.category === "Winter Collection"
                        ? "bg-indigo-100 text-indigo-800"
                        : product.category === "All Season"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {product.category}
                  </span>
                )}

                <h3 className="text-lg font-semibold text-gray-900 transition-colors duration-300 line-clamp-1">
                  {product.title}
                </h3>

                <div className="flex gap-2 text-center justify-center items-center">
                  <span className="text-xs md:text-lg font-bold text-red-500">Rs. {product.price}</span>
                  {product.oldPrice && <span className="text-xs md:text-sm text-gray-500 line-through">Rs. {product.oldPrice}</span>}
                </div>

                {product.oldPrice && product.price && (
                  <span className="bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded mt-6">
                    Save Rs. {product.oldPrice - product.price}
                  </span>
                )}
              </div>
            </div>
          );

          return inStock ? (
            <SwiperSlide key={product._id}>
              <Link href={`/product/${product.slug || product._id}`}>{cardContent}</Link>
            </SwiperSlide>
          ) : (
            <SwiperSlide key={product._id}>{cardContent}</SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}
