"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { X, SlidersHorizontal, ChevronDown, ChevronRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import Link from "next/link";

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-4 border-b pb-4">
      <button
        className="flex items-center justify-between w-full font-medium mb-2"
        onClick={() => setOpen(!open)}
      >
        {title}
        {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      </button>

      {open && <div className="space-y-1 text-sm">{children}</div>}
    </div>
  );
}

function PriceFilter({ filters, setFilters }) {
  const minLimit = 0;
  const maxLimit = 20000;

  const [min, setMin] = useState(minLimit);
  const [max, setMax] = useState(maxLimit);

  const [minInput, setMinInput] = useState(minLimit);
  const [maxInput, setMaxInput] = useState(maxLimit);

  // Reset on load
  useEffect(() => {
    setMin(minLimit);
    setMax(maxLimit);
    setMinInput(minLimit);
    setMaxInput(maxLimit);

    setFilters((prev) => ({
      ...prev,
      price: { min: minLimit, max: maxLimit },
    }));
  }, []);

  const handleInputChange = (type, value) => {
    let clean = value.replace(/^0+/, "");
    if (clean === "") clean = "0";
    const num = Number(clean);

    if (type === "min") {
      setMinInput(clean);
      if (num >= minLimit && num <= max) {
        setMin(num);
        setFilters((prev) => ({ ...prev, price: { min: num, max } }));
      }
    } else {
      setMaxInput(clean);
      if (num <= maxLimit && num >= min) {
        setMax(num);
        setFilters((prev) => ({ ...prev, price: { min, max: num } }));
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Inputs */}
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <input
          type="number"
          value={minInput}
          onChange={(e) => handleInputChange("min", e.target.value)}
          className="w-20 border rounded px-2 py-1 text-sm"
        />

        <span className="mx-2">-</span>

        <input
          type="number"
          value={maxInput}
          onChange={(e) => handleInputChange("max", e.target.value)}
          className="w-20 border rounded px-2 py-1 text-sm"
        />
      </div>

      {/* Slider labels */}
      <div className="flex justify-between text-sm text-gray-600">
        <span>Rs.{min}</span>
        <span>Rs.{max}</span>
      </div>

      {/* Slider */}
      <div className="relative w-full h-1 bg-gray-200 rounded">
        {/* Active Highlight */}
        <div
          className="absolute h-1 bg-gray-500 rounded"
          style={{
            left: `${((min - minLimit) / (maxLimit - minLimit)) * 100}%`,
            right: `${100 - ((max - minLimit) / (maxLimit - minLimit)) * 100}%`,
          }}
        />

        {/* Min Slider */}
        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          step="100"
          value={min}
          onChange={(e) => {
            const v = Number(e.target.value);
            setMin(v);
            setMinInput(v);
            setFilters((prev) => ({ ...prev, price: { min: v, max } }));
          }}
          className="absolute w-full h-1 bg-transparent appearance-none pointer-events-none
            [&::-webkit-slider-thumb]:pointer-events-auto
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:bg-black
            [&::-webkit-slider-thumb]:rounded-full"
        />

        {/* Max Slider */}
        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          step="100"
          value={max}
          onChange={(e) => {
            const v = Number(e.target.value);
            setMax(v);
            setMaxInput(v);
            setFilters((prev) => ({ ...prev, price: { min, max: v } }));
          }}
          className="absolute w-full h-1 bg-transparent appearance-none pointer-events-none
            [&::-webkit-slider-thumb]:pointer-events-auto
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:bg-black
            [&::-webkit-slider-thumb]:rounded-full"
        />
      </div>
    </div>
  );
}

export default function NewArrival() {
  const { addToCart } = useCart();
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    fabric: [],
    weave: [],
    price: { min: 0, max: 20000 },
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`/api/getproducts`);
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error("❌ Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const clearAllFilters = () => {
    setFilters({
      fabric: [],
      weave: [],
      price: { min: 0, max: 20000 },
    });
  };

  const toggleFilter = (type, value) => {
    setFilters((prev) => {
      const exists = prev[type].includes(value);

      return {
        ...prev,
        [type]: exists
          ? prev[type].filter((f) => f !== value)
          : [...prev[type], value],
      };
    });
  };

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      const fabricMatch =
        filters.fabric.length === 0 || filters.fabric.includes(p.fabric);

      const weaveMatch =
        filters.weave.length === 0 || filters.weave.includes(p.weave);

      const priceMatch =
        p.price >= filters.price.min && p.price <= filters.price.max;

      return fabricMatch && weaveMatch && priceMatch;
    });

    if (sortBy === "low-high") result.sort((a, b) => a.price - b.price);
    if (sortBy === "high-low") result.sort((a, b) => b.price - a.price);

    if (sortBy === "newest")
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (sortBy === "oldest")
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    if (sortBy === "az")
      result.sort((a, b) =>
        a.title.localeCompare(b.title, "en", { sensitivity: "base" })
      );

    if (sortBy === "za")
      result.sort((a, b) =>
        b.title.localeCompare(a.title, "en", { sensitivity: "base" })
      );

    return result;
  }, [filters, products, sortBy]);

  return (
    <>
      {/* Header */}
      <div
        className="relative font-semibold text-center mb-8 bg-cover bg-center h-[250px] sm:h-[350px] md:h-[500px] lg:h-[600px]"
        style={{
          backgroundImage: `url('/category/newarrival.png')`,
        }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/60"></div>

        {/* Centered text content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4">
          <h1 className="uppercase text-2xl sm:text-4xl md:text-5xl tracking-wide mb-3 drop-shadow-lg">
            New Arrival
          </h1>
          <p className="text-sm sm:text-base md:text-lg font-medium max-w-xl ">
            Welcome to the TimeTex Fabrics New Arrival Collection, where every
            fabric reflects exceptional quality and refined design. Our latest
            unstitched collection is crafted to offer comfort, style, and
            versatility, helping you create outfits that stand out with
            elegance. Explore our new arrival collection in Pakistan, featuring
            designs that blend timeless elements with contemporary trends. The
            Men’s New Arrival Collection 2026 presents premium fabrics suitable
            for every occasion, thoughtfully curated to elevate your personal
            style.
          </p>
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-6 md:px-14 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div
            className={`${
              showFilters
                ? "fixed top-0 left-0 h-full w-64 bg-gray-100 p-4 z-50 md:hidden"
                : "hidden md:block md:sticky md:top-24 md:w-64 md:p-4"
            }`}
          >
            <div className="flex items-center justify-between mb-4 md:hidden">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button onClick={() => setShowFilters(false)}>
                <X size={22} />
              </button>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold hidden md:block">Filters</h2>
              <button
                onClick={clearAllFilters}
                className="text-xs text-gray-500 underline hover:text-black"
              >
                Clear All
              </button>
            </div>

            <FilterSection title="Fabric">
              {["Blended", "Cotton"].map((f) => (
                <label key={f} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.fabric.includes(f)}
                    onChange={() => toggleFilter("fabric", f)}
                  />
                  {f}
                </label>
              ))}
            </FilterSection>

            <FilterSection title="Weave">
              {["Plain", "Self Slub", "Slub", "Wash & Wear"].map((w) => (
                <label key={w} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.weave.includes(w)}
                    onChange={() => toggleFilter("weave", w)}
                  />
                  {w}
                </label>
              ))}
            </FilterSection>

            <FilterSection title="Price">
              <PriceFilter filters={filters} setFilters={setFilters} />
            </FilterSection>
          </div>

          {/* Products */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setShowFilters((prev) => !prev)}
                className="flex items-center gap-1 border px-3 py-1 rounded md:hidden"
              >
                <SlidersHorizontal size={16} /> Filter
              </button>

              <h2 className="text-lg font-semibold">
                {filteredProducts.length} Products
              </h2>

              <select
                className="border px-2 py-1 text-sm rounded"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Date, new to old</option>
                <option value="oldest">Date, old to new</option>
                <option value="az">Alphabetically, A-Z</option>
                <option value="za">Alphabetically, Z-A</option>
                <option value="low-high">Price: low to high</option>
                <option value="high-low">Price: high to low</option>
              </select>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-gray-200 rounded-lg h-72"
                  ></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => {
                    const totalStock =
                      product.variants?.reduce((sum, v) => {
                        return (
                          sum +
                          (v.sizes?.reduce(
                            (s, size) => s + (size.stock || 0),
                            0
                          ) || 0)
                        );
                      }, 0) || 0;

                    const inStock = totalStock > 0;

                    const discount =
                      product.oldPrice && product.oldPrice > product.price
                        ? Math.round(
                            ((product.oldPrice - product.price) /
                              product.oldPrice) *
                              100
                          )
                        : null;

                    const daysOld =
                      (Date.now() - new Date(product.createdAt).getTime()) /
                      (1000 * 60 * 60 * 24);

                    const isNewArrival = daysOld <= 30;

                    let badgeColor = "bg-red-600";
                    if (discount > 40 && discount <= 70)
                      badgeColor = "bg-orange-500";
                    if (discount > 70) badgeColor = "bg-green-600";

                    const cardContent = (
                      <div
                        key={product._id}
                        className={`group relative bg-white shadow-md border border-gray-100 transition-all duration-500 overflow-hidden ${
                          !inStock
                            ? "opacity-60 cursor-not-allowed"
                            : "cursor-pointer hover:shadow-lg"
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

                        {/* Image */}
                        <div className="relative w-full bg-gray-100 overflow-hidden">
                          <div className="relative overflow-hidden group">
                            <Image
                              src={
                                product.images?.mainImage?.url ||
                                "/placeholder.png"
                              }
                              alt={product.title}
                              width={400}
                              height={500}
                              className="w-full object-cover transition-opacity duration-700 group-hover:opacity-0"
                            />

                            {inStock && product.images?.hoverImage?.url && (
                              <Image
                                src={product.images?.hoverImage?.url}
                                alt={`${product.title} hover`}
                                width={400}
                                height={500}
                                className="absolute top-0 left-0 w-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                              />
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 text-center">
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                            {product.title}
                          </h3>

                          <div className="flex gap-2 justify-center items-center">
                            <span className="text-lg font-bold text-black">
                              Rs. {product.price}
                            </span>

                            {product.oldPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                Rs. {product.oldPrice}
                              </span>
                            )}
                          </div>

                          {product.oldPrice && (
                            <span className="bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">
                              Save Rs. {product.oldPrice - product.price}
                            </span>
                          )}
                        </div>
                      </div>
                    );

                    return inStock ? (
                      <Link
                        key={product._id}
                        href={`/products/${product.slug}`}
                      >
                        {cardContent}
                      </Link>
                    ) : (
                      <div key={product._id}>{cardContent}</div>
                    );
                  })
                ) : (
                  <p className="text-gray-500">No products found.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
