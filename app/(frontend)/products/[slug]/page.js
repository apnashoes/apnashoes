"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaWhatsapp, FaFacebookF, FaTwitter } from "react-icons/fa";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import RecommendedProducts from "@/component/RecommendedProducts";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";
import { Home, Tag, ShoppingCart } from "lucide-react";
import Swal from "sweetalert2";
import SEO from "@/component/SEO";

/* 🔹 Skeleton Loader */
function SkeletonLoader() {
  return (
    <div className="animate-pulse max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-4">
          <div className="w-full h-[400px] bg-gray-200 rounded-lg"></div>
          <div className="flex gap-3">
            <div className="w-24 h-24 bg-gray-200 rounded-md"></div>
            <div className="w-24 h-24 bg-gray-200 rounded-md"></div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="w-2/3 h-6 bg-gray-200 rounded"></div>
          <div className="w-1/3 h-6 bg-gray-200 rounded"></div>
          <div className="w-1/4 h-4 bg-gray-200 rounded"></div>
          <div className="w-full h-20 bg-gray-200 rounded"></div>
          <div className="w-1/2 h-10 bg-gray-200 rounded"></div>
          <div className="flex gap-3">
            <div className="w-32 h-12 bg-gray-200 rounded"></div>
            <div className="w-32 h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 🔹 Fullscreen Loader */
function FullscreenLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="flex flex-col items-center animate-pulse">
        <img
          src="/logo.png"
          alt="Brand Logo"
          className="w-54 h-54 object-contain animate-bounce"
        />
        <p className="mt-4 text-sm font-medium text-gray-600">
          Loading product...
        </p>
      </div>
    </div>
  );
}

export default function ProductPage({ params }) {
  const { addToCart, clearCart } = useCart();
  const { slug } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [popupMessage, setPopupMessage] = useState("");
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  // ✅ Selections
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const router = useRouter();
  const scrollRef = useRef(null);

  // auto select color and size

  const currentVariant = product?.variants?.find(
    (v) => v.color?.name === selectedColor?.name,
  );

  const selectedSizeData = currentVariant?.sizes?.find(
    (s) => String(s.size) === selectedSize,
  );

  const isOutOfStock = selectedSizeData?.stock === 0;

  // auto select color and size end code

  // ✅ Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/getproducts/?slug=${slug}`);
        const data = await res.json();

        if (data.product) {
          setProduct(data.product);
          setActiveImage(
            data.product.images?.main.url ||
              data.product.images?.gallery?.[0]?.url ||
              null,
          );

          // Recommended
          if (data.product._id) {
            fetch(`/api/recommended/${data.product._id}`)
              .then((res) => res.json())
              .then((r) => setRecommended(r.recommended))
              .catch((err) => console.log("Recommended Error:", err));
          }

          // ❌ Do NOT auto-select anything
          setSelectedColor(null);
          setSelectedSize(null);
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error("❌ Failed to fetch product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  // auto select color and size useEffect

  useEffect(() => {
    if (product?.variants?.length > 0) {
      setSelectedColor(product.variants[0].color);
    }
  }, [product]);

  useEffect(() => {
    if (!selectedColor) return;

    const variant = product.variants.find(
      (v) => v.color?.name === selectedColor?.name,
    );

    const firstAvailableSize = variant?.sizes.find((s) => s.stock > 0);

    if (firstAvailableSize) {
      setSelectedSize(String(firstAvailableSize.size));
    } else {
      setSelectedSize(null); // no stock case
    }
  }, [selectedColor, product]);

  // auto select color and size useEffect end code

  const selectedVariant = product?.variants?.find(
    (v) => v.color.name === selectedColor?.name,
  );

  // find selected size stock
  const sizeData = selectedVariant?.sizes?.find(
    (s) => String(s.size) === String(selectedSize),
  );

  const remainingStock = sizeData?.stock || 0;

  // total stock (sum of all sizes)
  const totalStock =
    selectedVariant?.sizes?.reduce((acc, s) => acc + (s.stock || 0), 0) || 0;

  const stockPercent = totalStock > 0 ? (remainingStock / totalStock) * 100 : 0;

  const decreaseQty = () => quantity > 1 && setQuantity(quantity - 1);
  const increaseQty = () => setQuantity(quantity + 1);

  const images = product
    ? [
        product.images?.main?.url,
        ...(product.images?.gallery?.map((g) => g.url) || []),
      ].filter(Boolean)
    : [];

  const disableActions =
    !product || !selectedColor || !selectedSize || remainingStock === 0;

  if (loading) {
    return (
      <>
        <FullscreenLoader />
        <SkeletonLoader />
      </>
    );
  }

  const handleBuyNow = () => {
    if (disableActions) return; // prevent action if product is not selectable

    clearCart(); // optional: remove existing cart items
    addToCart({
      ...product,
      selectedColor,
      selectedSize,
      quantity,
    });

    router.push("/checkoutpage");
  };

  function validateSelection() {
    if (!selectedColor) {
      Swal.fire({
        icon: "warning",
        title: "Select Color",
        text: "Please select a color first.",
        confirmButtonColor: "#C8A26A",
      });
      return false;
    }

    if (!selectedSize) {
      Swal.fire({
        icon: "warning",
        title: "Select Size",
        text: "Please select a size first.",
        confirmButtonColor: "#C8A26A",
      });
      return false;
    }

    return true;
  }

  const scrollAmount = 120;

  return (
    <>
      <SEO
        title={`${product.title} – Timetex Fabrics`}
        description={product.shortDescription || product.title}
        image={product.images?.main.url}
        url={`https://timetex.pk/product/${product.slug}`}
      />
      <div className="max-w-6xl mx-auto p-6">
        {!product ? (
          <div className="p-6 text-red-600">Product not found!</div>
        ) : (
          <>
            {/* Breadcrumb */}
            <nav className="mb-6">
              <ol className="flex items-center space-x-3 text-sm">
                {/* Home */}
                <li className="flex items-center gap-1">
                  <Link
                    href="/"
                    className="flex items-center gap-1 bg-black text-white px-3 py-1.5 rounded-full font-medium hover:bg-opacity-80 transition"
                  >
                    <Home className="w-4 h-4 hidden md:inline-block text-white" />
                    <span className="text-[10px] md:text-sm">Home</span>
                  </Link>
                </li>

                <li className="text-gray-400">/</li>

                {/* Category */}
                <li className="flex items-center gap-1">
                  <span className="flex items-center gap-1 bg-white text-black border border-gray-300 px-3 py-1.5 rounded-full capitalize">
                    <Tag className="w-4 h-4 hidden md:inline-block text-black" />
                    <span className="text-[10px] md:text-sm">
                      {product.category}
                    </span>
                  </span>
                </li>

                <li className="text-gray-400">/</li>

                {/* Slug */}
                <li className="flex items-center gap-1">
                  <span className="flex items-center gap-1 bg-black text-white px-3 py-1.5 rounded-full font-semibold capitalize">
                    <Tag className="w-4 h-4 hidden md:inline-block text-white" />
                    <span className="text-[10px] md:text-sm">
                      {product.slug}
                    </span>
                  </span>
                </li>
              </ol>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Left Side */}
              
              <div className="flex flex-col gap-4 w-full">
                {/* 🔹 Main Image */}
                <div className="w-full">
                  <Zoom>
                    <img
                      src={activeImage}
                      alt="Product image"
                      className="w-full h-[550px] object-contain rounded-lg cursor-zoom-in"
                    />
                  </Zoom>
                </div>

                {/* 🔹 Thumbnails Slider */}
                <div className="flex items-center gap-2">
                  {/* ◀ Left */}
                  <button
                    onClick={() =>
                      scrollRef.current?.scrollBy({
                        left: -scrollAmount,
                        behavior: "smooth",
                      })
                    }
                    className=" px-2 py-1"
                  >
                    ◀
                  </button>

                  {/* Thumbnails */}
                  <div
                    ref={scrollRef}
                    className="flex gap-3 overflow-x-auto no-scrollbar flex-1"
                  >
                    {images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(img)}
                        className={`min-w-[80px] h-[90px] rounded-lg overflow-hidden border-2 transition ${
                          activeImage === img
                            ? "border-[#C8A26A] shadow-md"
                            : "border-gray-200 hover:border-black"
                        }`}
                      >
                        <img
                          src={img}
                          className="w-full h-full object-cover"
                          alt="thumb"
                        />
                      </button>
                    ))}
                  </div>

                  {/* ▶ Right */}
                  <button
                    onClick={() =>
                      scrollRef.current?.scrollBy({
                        left: scrollAmount,
                        behavior: "smooth",
                      })
                    }
                    className="px-2 py-1"
                  >
                    ▶
                  </button>
                </div>
              </div>
              {/* Right Side */}
              <div>
                <h1 className="text-2xl font-semibold mb-2">{product.title}</h1>

                <div className="mt-2 flex items-center gap-2">
                  <span className="text-lg font-bold text-black">
                    Rs. {product.price}
                  </span>
                  {product.oldPrice && (
                    <span className="text-sm text-gray-500 line-through my-2">
                      Rs. {product.oldPrice}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  Category: {product.category}
                </p>

                {/* Please hurry! Only 10 left in stock */}

                {/* <div className="my-2 "> */}
                {/* Stock Text */}
                {/* <p className="text-sm text-red-500 font-medium">
                    Please hurry! Only {remainingStock} left in stock
                  </p> */}

                {/* Progress Bar */}
                {/* <div className="w-full bg-gray-200 h-2 rounded mt-1">
                    <div
                      className="h-2 rounded transition-all duration-500 bg-gradient-to-r from-red-500 via-orange-400 to-green-500"
                      style={{ width: `${stockPercent}%` }}
                    ></div>
                  </div>
                </div> */}

                <div className="my-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-red-500 font-medium">
                      Please hurry! Only {remainingStock} left in stock
                    </span>
                    <span className="text-gray-500">
                      {Math.round(stockPercent)}% left
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 h-2 rounded">
                    <div
                      className="h-2 rounded bg-gradient-to-r from-red-500 via-yellow-400 to-green-500"
                      style={{ width: `${stockPercent}%` }}
                    />
                  </div>
                </div>

                {/* Color Selector */}
                {product.variants && product.variants.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">
                      Color
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {product.variants.map((variant, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedColor(variant.color);
                            setSelectedSize(null);
                          }}
                          className={`flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 border ${
                            selectedColor?.name === variant.color.name
                              ? "border-[#C8A26A] text-black"
                              : "border-gray-300 text-gray-700 hover:border-black"
                          }`}
                        >
                          <span
                            className="w-5 h-5 rounded-full "
                            style={{
                              backgroundColor: variant.color.code || "#ccc",
                            }}
                          ></span>
                          <span>{variant.color.name}</span>
                        </button>
                      ))}
                    </div>
                    {selectedColor && (
                      <p className="text-sm text-gray-600 mt-2">
                        Selected:
                        <span className="font-medium">
                          {selectedColor.name}
                        </span>
                      </p>
                    )}
                  </div>
                )}

                {/* Size Selector */}
                {product.variants && product.variants.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">
                      Size
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {product.variants
                        ?.find((v) => v.color?.name === selectedColor?.name)
                        ?.sizes.map((s, i) => {
                          const sizeValue = String(s.size);
                          const isSelected = selectedSize === sizeValue;
                          const isOutOfStock = s.stock === 0; // ✅ ADD THIS

                          return (
                            <button
                              key={i}
                              onClick={() =>
                                !isOutOfStock && setSelectedSize(sizeValue)
                              } // ✅ prevent click
                              disabled={isOutOfStock} // ✅ disable button
                              className={`rounded-md px-4 py-2 text-sm font-medium border transition-all duration-200 ${
                                isOutOfStock
                                  ? "bg-gray-200 text-gray-400 cursor-not-allowed border-gray-200" // ❌ disabled style
                                  : isSelected
                                    ? "bg-black text-white border-[#C8A26A] shadow-[0_0_8px_rgba(200,162,106,0.4)]"
                                    : "border-gray-300 text-gray-700 hover:border-black"
                              }`}
                            >
                              {sizeValue}
                            </button>
                          );
                        })}
                    </div>

                    {selectedSize && (
                      <p className="text-sm text-gray-600 mt-2">
                        Selected:{" "}
                        <span className="font-medium text-gray-700">
                          {selectedSize}
                        </span>
                      </p>
                    )}
                  </div>
                )}

                {/* Size Guide */}

                <button
                  onClick={() => setShowSizeGuide(true)}
                  className="text-sm underline text-gray-600 hover:text-black"
                >
                  Size Guide
                </button>

                {showSizeGuide && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full relative">
                      {/* Close Button */}
                      <button
                        onClick={() => setShowSizeGuide(false)}
                        className="absolute top-2 right-2 text-gray-500 text-xl"
                      >
                        ✕
                      </button>

                      <h2 className="text-lg font-semibold mb-4">Size Guide</h2>

                      {/* Table */}
                      <table className="w-full text-sm border">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border p-2">Size</th>
                            <th className="border p-2">Foot Length (cm)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border p-2">28</td>
                            <td className="border p-2">17.5</td>
                          </tr>
                          <tr>
                            <td className="border p-2">29</td>
                            <td className="border p-2">18.0</td>
                          </tr>
                          <tr>
                            <td className="border p-2">30</td>
                            <td className="border p-2">18.5</td>
                          </tr>
                          <tr>
                            <td className="border p-2">31</td>
                            <td className="border p-2">19.0</td>
                          </tr>
                          <tr>
                            <td className="border p-2">32</td>
                            <td className="border p-2">19.5</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Quantity + Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch gap-3 mb-6">
                  <div className="flex items-center justify-between border border-gray-300 rounded w-full max-w-[160px]">
                    <button
                      onClick={decreaseQty}
                      className="w-10 h-10 flex items-center justify-center text-xl font-bold hover:bg-gray-100 transition"
                    >
                      –
                    </button>

                    <span className="w-12 text-center text-lg font-medium">
                      {quantity}
                    </span>

                    <button
                      onClick={increaseQty}
                      className="w-10 h-10 flex items-center justify-center text-xl font-bold hover:bg-gray-100 transition"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      if (!validateSelection()) return;

                      addToCart({
                        ...product,
                        selectedColor,
                        selectedSize,
                        quantity,
                      });
                    }}
                    disabled={disableActions}
                    className={`w-full flex items-center justify-center gap-2 bg-[#C8A26A] px-10 py-3 text-sm font-semibold uppercase tracking-wider rounded transition-all duration-300 ${
                      !disableActions
                        ? "bg-[#C8A26A] text-white "
                        : "border-gray-900 text-gray-700 hover:border-[#C8A26A]"
                    }`}
                  >
                    <ShoppingCart size={18} />
                    {disableActions ? "Out of Stock" : "Add to Cart"}
                  </button>
                </div>

                {/* Buy Now + WhatsApp */}
                <div className="flex flex-col gap-3 mb-6">
                  <button
                    onClick={() => {
                      if (!validateSelection()) return;
                      handleBuyNow();
                    }}
                    disabled={disableActions}
                    className={`relative inline-block px-8 py-4 text-sm font-semibold uppercase tracking-wider overflow-hidden group rounded text-center ${
                      !disableActions
                        ? "text-white bg-black hover:bg-black/90"
                        : "border-red-500 text-red-500 cursor-not-allowed line-through"
                    }`}
                  >
                    Buy Now
                  </button>

                  <Link
                    href={`https://wa.me/923116967985?text=Hello!%20I%20want%20to%20order%20the%20product:%20${encodeURIComponent(
                      product.title,
                    )}%20(Size:%20${selectedSize || "N/A"},%20Color:${
                      selectedColor?.name || "N/A"
                    })`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-green-500 text-white font-semibold py-4 rounded hover:bg-green-600 transition-all duration-300"
                  >
                    <FaWhatsapp size={20} />
                    Order on WhatsApp
                  </Link>
                </div>

                {/* Social Share */}
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-gray-600 text-sm">Share:</span>
                  <Link
                    href="https://facebook.com"
                    target="_blank"
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                  >
                    <FaFacebookF size={18} className="text-gray-700" />
                  </Link>
                  <Link
                    href="https://twitter.com"
                    target="_blank"
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                  >
                    <FaTwitter size={18} className="text-gray-700" />
                  </Link>
                  <Link
                    href="https://wa.me/?text=Check%20this%20product!"
                    target="_blank"
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                  >
                    <FaWhatsapp size={18} className="text-gray-700" />
                  </Link>
                </div>

                {/* Description */}
                {/* <div className="text-gray-700 leading-relaxed">
                  <p className="mb-3">{product.description}</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Fabric Base: {product.category}</li>
                    <li>Weave Type: {product.weave}</li>
                  </ul>
                </div> */}
                <div className="mt-12">
                  {/* Tabs */}
                  <div className="flex gap-6 border-b">
                    {["description", "additional", "reviews"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 text-sm font-medium capitalize ${
                          activeTab === tab
                            ? "border-b-2 border-[#C8A26A] text-black"
                            : "text-gray-500"
                        }`}
                      >
                        {tab === "additional"
                          ? "Additional Information"
                          : tab === "reviews"
                            ? "Reviews (4)"
                            : "Description"}
                      </button>
                    ))}
                  </div>

                  {/* Content */}
                  <div className="mt-6 text-gray-700">
                    {activeTab === "description" && (
                      <p>{product.description}</p>
                    )}

                    {activeTab === "additional" && (
                      <ul className="space-y-2">
                        <li>
                          <strong>Category:</strong> {product.category}
                        </li>
                        <li>
                          <strong>Weave:</strong> {product.weave}
                        </li>
                      </ul>
                    )}

                    {activeTab === "reviews" && <p>No reviews yet.</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="border rounded-lg p-4 flex gap-3 items-center">
                    <div className="text-xl">🚚</div>
                    <div>
                      <p className="font-medium text-sm">Fast Shipping</p>
                      <p className="text-xs text-gray-500">
                        Get your order delivered quickly
                      </p>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 flex gap-3 items-center">
                    <div className="text-xl">↩️</div>
                    <div>
                      <p className="font-medium text-sm">Easy Returns</p>
                      <p className="text-xs text-gray-500">
                        14 days return policy
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Products */}
            {recommended.length > 0 && (
              <RecommendedProducts
                productId={product._id}
                category={product.category}
              />
            )}
          </>
        )}
      </div>

      {popupMessage && (
        <div className="fixed inset-0 bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-lg text-center w-64">
            <p className="text-gray-800 font-medium mb-4">{popupMessage}</p>
            <button
              onClick={() => setPopupMessage("")}
              className="bg-black text-white px-4 py-2 rounded w-full"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}
