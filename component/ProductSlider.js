"use client";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { FiHeart } from "react-icons/fi";
import { useWishlist } from "../app/(frontend)/context/WishlistContext"; // adjust path if needed

export const ProductSlider = ({ title }) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [activeIndex, setActiveIndex] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(4);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false); // ✅ add this
  const [selectedSize, setSelectedSize] = useState(null);
  const [expanded, setExpanded] = useState({});

  // ✅ Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true); // ✅ now works
      try {
        const res = await fetch("/api/getproducts");
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error("❌ Failed to fetch products:", err);
      } finally {
        setLoading(false); // ✅ also works
      }
    };
    fetchProducts();
  }, []);

  // ✅ Filter: only show "new arrival" & "in stock"
  const newArrivalProducts = products
    .filter((product) => {
      // ✅ Check stock inside variants and sizes
      const hasStock = product.variants?.some((variant) =>
        variant.sizes?.some((size) => size.stock > 0),
      );

      if (!hasStock) return false;

      const daysOld =
        (new Date().getTime() - new Date(product.createdAt).getTime()) /
        (1000 * 60 * 60 * 24);
      return daysOld <= 30; // new arrivals within 30 days
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // ⬅️ NEW: newest first

  // --- Responsive slides per view ---
  useEffect(() => {
    const updateSlides = () => {
      if (window.innerWidth >= 1024) setSlidesPerView(4);
      else if (window.innerWidth >= 768) setSlidesPerView(2);
      else setSlidesPerView(1);
    };
    updateSlides();
    window.addEventListener("resize", updateSlides);
    return () => window.removeEventListener("resize", updateSlides);
  }, []);

  const nextSlide = () => {
    if (activeIndex < newArrivalProducts.length - Math.ceil(slidesPerView)) {
      setActiveIndex((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
    }
  };

  // ✅ conditional render happens here, not before hooks
  if (loading) {
    return (
      <div className="w-full px-4 md:px-12 py-10 relative">
        <p className="text-center">Apna Shoes ...</p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-12 py-10 relative">
      {/* ===================== Animated Heading ===================== */}
      <div className="flex items-center justify-center text-2xl md:text-3xl lg:text-4xl font-bold mb-6 px-4 text-center">
        <span className="h-[1.5px] w-10 sm:w-16 md:w-24 bg-gray-300 mr-4 origin-right"></span>

        <h2>{title}</h2>

        <span className="h-[1.5px] w-10 sm:w-16 md:w-24 bg-gray-300 ml-4 origin-left"></span>
      </div>

      {/* Prev Button */}
      <button
        onClick={prevSlide}
        disabled={activeIndex === 0}
        className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md transition 
        ${
          activeIndex === 0
            ? "opacity-40 cursor-not-allowed"
            : "hover:scale-110"
        }`}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Next Button */}
      <button
        onClick={nextSlide}
        disabled={
          activeIndex >= newArrivalProducts.length - Math.ceil(slidesPerView)
        }
        className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md transition 
        ${
          activeIndex >= newArrivalProducts.length - Math.ceil(slidesPerView)
            ? "opacity-40 cursor-not-allowed"
            : "hover:scale-110"
        }`}
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slider wrapper */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${(activeIndex * 100) / slidesPerView}%)`,
          }}
        >
          {newArrivalProducts.length > 0 ? (
            newArrivalProducts.map((product) => {
              const discount =
                product.price && product.oldPrice
                  ? Math.round(
                      ((product.oldPrice - product.price) / product.oldPrice) *
                        100,
                    )
                  : null;

              return (
                <div
                  key={product._id}
                  className="flex-shrink-0 px-3"
                  style={{ width: `${100 / slidesPerView}%` }}
                >
                  <Link href={`/products/${product.slug}`}>
                    <div className="bg-white border hover:shadow-lg transition duration-300 group cursor-pointer overflow-hidden">
                      <div className="relative overflow-hidden">
                        {/* ✅ Badges */}
                        {discount && (
                          <span className="absolute top-2 left-2 z-10 bg-red-600 text-white text-xs font-semibold px-2 py-1">
                            {discount}% OFF
                          </span>
                        )}
                        {/* ✅ New Arrival */}
                        <span className="absolute top-2 right-2 z-10 bg-black text-white text-xs font-semibold px-2 py-1">
                          New Arrival
                        </span>

                        {/* ❤️ Wishlist Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            const item = {
                              _id: product._id,
                              name: product.title,
                              price: product.price,
                              image: product.images?.main?.url,
                            };

                            if (isInWishlist(product._id)) {
                              removeFromWishlist(product._id);
                            } else {
                              addToWishlist(item);
                            }
                          }}
                          className="absolute bottom-3 right-3 z-20 bg-white p-2 rounded-full shadow hover:scale-110 transition"
                        >
                          <FiHeart
                            size={18}
                            className={`transition ${
                              isInWishlist(product._id)
                                ? "text-red-500 fill-red-500"
                                : "text-gray-600"
                            }`}
                          />
                        </button>
                        {/* ✅ Product Images */}
                        <div className="relative w-full h-[460px] bg-gray-100 overflow-hidden">
                          <div className="relative w-full h-[460px] overflow-hidden">
                            {/* Main Image */}
                            <Image
                              src={
                                product.images?.gallery?.[
                                  activeIndex[product._id]
                                ]?.url || product.images?.main.url
                              }
                              alt={product.title}
                              fill
                              className="object-cover"
                            />
          
                            {/* Hover Image */}
                            {product.images?.gallery?.[0]?.url && (
                              <Image
                                src={product.images.gallery[0].url}
                                alt="hover"
                                fill
                                className="absolute top-0 left-0 object-cover opacity-0 hover:opacity-100 transition duration-700"
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* ✅ Product Info */}
                      <div className="p-3 text-left">
                        <div className="flex justify-between">
                          {/* Category */}
                          {product.category && (
                            <span
                              className={`inline-block text-start text-xs font-medium px-2 py-1 mb-2 ${
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
                              <span className="text-md font-bold">
                                Category :
                              </span>
                              {product.category}
                            </span>
                          )}

                          {/* ✅ Save Badge */}
                          {product.oldPrice && product.price && (
                            <span className="inline-block bg-red-100 text-red-600 font-medium text-xs px-2 py-1 mb-2">
                              <span className="">
                                Save Rs. {product.oldPrice - product.price}
                              </span>
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-gray-800 line-clamp-2">
                          {product.title}
                        </h3>

                        {/* Price */}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-red-500 font-bold text-lg">
                            Rs. {product.price}
                          </span>

                          {product.oldPrice && (
                            <span className="text-gray-400 line-through text-sm">
                              Rs. {product.oldPrice}
                            </span>
                          )}
                        </div>

                        {/* Variant Thumbnails */}
                        <div className="flex items-center gap-2 mb-2">
                          {product.images?.gallery?.length > 0 && (
                            <div className="flex items-center gap-2 mt-3 flex-wrap">
                              {(expanded[product._id]
                                ? product.images.gallery
                                : product.images.gallery.slice(0, 3)
                              ).map((img, i) => (
                                <div
                                  key={i}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setActiveIndex((prev) => ({
                                      ...prev,
                                      [product._id]: i,
                                    }));
                                  }}
                                  className={`p-[2px] rounded-full cursor-pointer transition
                                                   ${
                                                     (activeIndex[
                                                       product._id
                                                     ] ?? 0) === i
                                                       ? "bg-gradient-to-r from-pink-500 to-yellow-500"
                                                       : "bg-gray-300"
                                                   }`}
                                >
                                  <div className="w-8 h-8 rounded-full overflow-hidden bg-white">
                                    <Image
                                      src={img.url}
                                      alt={`variant-${i}`}
                                      width={32}
                                      height={32}
                                      className="object-cover w-full h-full"
                                    />
                                  </div>
                                </div>
                              ))}

                              {/* +More / Show Less */}
                              {product.images.gallery.length > 3 && (
                                <div
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setExpanded((prev) => ({
                                      ...prev,
                                      [product._id]: !prev[product._id],
                                    }));
                                  }}
                                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xs font-medium border cursor-pointer transition"
                                >
                                  {expanded[product._id]
                                    ? "−"
                                    : `+${product.images.gallery.length - 3}`}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500 w-full py-6">
              No new arrivals available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
