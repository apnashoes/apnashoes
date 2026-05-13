"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function BestSellers() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false); // ✅ add this
  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = useState({});

  // ✅ Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true); // ✅ now works
      try {
        const res = await fetch("/api/bestsellers");
        const data = await res.json();
        setProducts(data || []);
      } catch (err) {
        console.error("❌ Failed to fetch products:", err);
      } finally {
        setLoading(false); // ✅ also works
      }
    };
    fetchProducts();
  }, []);

  // ✅ conditional render happens here, not before hooks
  if (loading) {
    return (
      <div className="w-full px-4 md:px-12 py-10 relative">
        <p className="text-center">Apna Shoes ...</p>
      </div>
    );
  }

  return (
    <section className="py-12 px-6 lg:px-20 bg-gray-50">
      {/* Heading */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">🔥 Best Sellers</h2>
        <Link href="/shop" className="text-sm underline">
          View All
        </Link>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products?.slice(0, 6).map((product) => (
          <div
            key={product._id}
            className="group bg-white shadow-sm hover:shadow-md transition overflow-hidden"
          >
            <Link href={`/products/${product.slug}`}>
              {/* ✅ Product Images */}
              <div className="relative w-full h-[460px] bg-gray-100 overflow-hidden">
                <div className="relative w-full h-[460px] overflow-hidden">
                  {/* Main Image */}
                  {/* <Image
                    src={product.images?.main.url || "/placeholder.png"}
                    alt={product.title}
                    fill
                    className="object-cover transition-opacity duration-700 hover:opacity-0"
                  /> */}
                  <Image
                    src={
                      product.images?.gallery?.[activeIndex[product._id]]
                        ?.url || product.images?.main.url
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

                  {/* Badge */}
                  <span className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 rounded">
                    🔥 Best Seller
                  </span>
                </div>
              </div>
            </Link>

            {/* Info */}
            <div className="p-4">
              <h3 className="text-sm font-medium mb-1">{product.title}</h3>

              <div className="flex items-center gap-2">
                <span className="font-bold text-red-500 text-lg">Rs {product.price}</span>

                {product.oldPrice && (
                  <span className="text-gray-400 line-through text-sm">
                    Rs {product.oldPrice}
                  </span>
                )}
              </div>

              {/* Variant Thumbnails */}
              <div className="flex items-center gap-2">
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
                             (activeIndex[product._id] ?? 0) === i
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
        ))}
      </div>
    </section>
  );
}
