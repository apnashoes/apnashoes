"use client";
import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { X, SlidersHorizontal, ChevronDown, ChevronRight } from "lucide-react";
import { useCart } from "../../context/CartContext";
import Link from "next/link";
import { useParams } from "next/navigation";

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

function PriceFilter({ filters, setFilters, category }) {
  // Dynamic category limits
  const minLimit = category === "luxury" ? 7000 : 2000;
  const maxLimit = category === "luxury" ? 11000 : 8000;

  // Actual slider values (used for filtering)
  const [min, setMin] = useState(minLimit);
  const [max, setMax] = useState(maxLimit);

  // Input field values (typing only)
  const [minInput, setMinInput] = useState(minLimit);
  const [maxInput, setMaxInput] = useState(maxLimit);

  // When category changes → reset everything
  useEffect(() => {
    setMin(minLimit);
    setMax(maxLimit);
    setMinInput(minLimit);
    setMaxInput(maxLimit);

    setFilters((prev) => ({
      ...prev,
      price: { min: minLimit, max: maxLimit },
    }));
  }, [category]);

  // Handle typing (does NOT move slider bar)
  const handleInputChange = (type, value) => {
    // Remove all leading zeros
    let clean = value.replace(/^0+/, "");

    // If empty after cleaning, set to 0
    if (clean === "") clean = "0";

    let num = Number(clean);

    if (type === "min") {
      setMinInput(clean);

      if (num >= minLimit && num <= max) {
        setMin(num);
        setFilters((prev) => ({
          ...prev,
          price: { min: num, max },
        }));
      }
    } else {
      setMaxInput(clean);

      if (num <= maxLimit && num >= min) {
        setMax(num);
        setFilters((prev) => ({
          ...prev,
          price: { min, max: num },
        }));
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Input fields */}
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
        {/* Active highlight */}
        <div
          className="absolute h-1 bg-gray-500 rounded"
          style={{
            left: `${((min - minLimit) / (maxLimit - minLimit)) * 100}%`,
            right: `${100 - ((max - minLimit) / (maxLimit - minLimit)) * 100}%`,
          }}
        />

        {/* Min slider */}
        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          step="50"
          value={min}
          onChange={(e) => {
            const v = Number(e.target.value);
            setMin(v);
            setMinInput(v);

            setFilters((prev) => ({
              ...prev,
              price: { min: v, max },
            }));
          }}
          className="absolute w-full h-1 bg-transparent appearance-none pointer-events-none
            [&::-webkit-slider-thumb]:pointer-events-auto
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:bg-black
            [&::-webkit-slider-thumb]:rounded-full"
        />

        {/* Max slider */}
        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          step="50"
          value={max}
          onChange={(e) => {
            const v = Number(e.target.value);
            setMax(v);
            setMaxInput(v);

            setFilters((prev) => ({
              ...prev,
              price: { min, max: v },
            }));
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

export default function Category() {
  const { categorySlug } = useParams();
  const { addToCart } = useCart();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    fabric: [],
    weave: [],
    price: { min: 2000, max: 8000 },
  });
  const [expanded, setExpanded] = useState({});
  const [activeIndex, setActiveIndex] = useState(0);

  const bgImages = {
    sneakers: "/category/sneakerbg.png",
    skechers: "/category/skecherbg.png",
    nike: "/category/nikebg.png",
    adidas: "/category/adidasbg.png",
    formal: "/category/formalbg.png",
  };

  // Define text for each category
  const categoryTexts = {
    "wash-and-wear":
      "Effortless style and easy maintenance — perfect for your everyday look.",
    cotton:
      "Soft, breathable, and natural — experience ultimate comfort with our cotton collection.",
    summer:
      "Stay cool and stylish this season with our lightweight, breezy summer fabrics.",
    winter:
      "Wrap yourself in warmth and sophistication with our premium winter textures.",
  };

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`/api/category/${categorySlug}`);
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error("❌ Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categorySlug]);

  const clearAllFilters = () => {
    setFilters({
      fabric: [],
      weave: [],
      price: { min: 2000, max: 8000 },
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

    if (sortBy === "low-high") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === "high-low") {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === "newest") {
      result = [...result].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
    } else if (sortBy === "oldest") {
      result = [...result].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      );
    } else if (sortBy === "az") {
      result = [...result].sort((a, b) =>
        a.title.localeCompare(b.title, "en", { sensitivity: "base" }),
      );
    } else if (sortBy === "za") {
      result = [...result].sort((a, b) =>
        b.title.localeCompare(a.title, "en", { sensitivity: "base" }),
      );
    }

    return result;
  }, [filters, products, sortBy]);

  return (
    <>
      <div
        className="relative font-semibold text-center mb-8 bg-cover bg-center h-[250px] sm:h-[300px] md:h-[500px] lg:h-[700px]"
        style={{
          backgroundImage: `url('${bgImages[categorySlug] || "/default.jpg"}')`,
        }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/60"></div>

        {/* Centered text content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4">
          <h1 className="uppercase text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide mb-3 drop-shadow-lg">
            {categorySlug.replace("-", " ")} Shoes
          </h1>
          <p className="text-sm sm:text-base md:text-lg font-medium max-w-xl drop-shadow-md">
            {categoryTexts[categorySlug] ||
              "Discover our elegant, easy-care fabrics crafted for comfort, durability, and timeless sophistication."}
          </p>
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-6 md:px-14 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div
            className={`${
              showFilters
                ? "fixed top-0 left-0 h-full w-64 bg-gray-100 p-4 z-50 transform transition-transform duration-300 overflow-y-auto md:hidden"
                : "hidden md:block md:sticky md:top-24 md:h-[calc(100vh-10rem)] md:w-64 md:p-4 md:overflow-y-auto"
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
            {/* Fabric */}
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
            {/* Weave */}
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
            {/* Price */}handleChange
            <FilterSection title="Price">
              <PriceFilter
                filters={filters}
                setFilters={setFilters}
                category={categorySlug}
              />
            </FilterSection>
          </div>

          {/* Products */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setShowFilters((prev) => !prev)}
                className="flex items-center gap-1 border px-3 py-1 rounded"
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
                <option value="best">Best selling</option>
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
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => {
                    // ✅ Calculate total stock
                    const totalStock =
                      product.variants?.reduce((sum, v) => {
                        return (
                          sum +
                          (v.sizes?.reduce(
                            (s, size) => s + (size.stock || 0),
                            0,
                          ) || 0)
                        );
                      }, 0) || 0;

                    const inStock = totalStock > 0;

                    const discount =
                      product.oldPrice && product.oldPrice > product.price
                        ? Math.round(
                            ((product.oldPrice - product.price) /
                              product.oldPrice) *
                              100,
                          )
                        : null;

                    const daysOld =
                      (Date.now() - new Date(product.createdAt).getTime()) /
                      (1000 * 60 * 60 * 24);
                    const isNewArrival = daysOld <= 30;

                    let badgeColor = "bg-red-600";
                    if (discount > 40 && discount <= 70)
                      badgeColor = "bg-orange-500";
                    else if (discount > 70) badgeColor = "bg-green-600";

                    const cardContent = (
                      <div
                        key={product._id}
                        className={`group relative bg-white shadow-md transition-all duration-500 overflow-hidden border border-gray-100 ${
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

                        {/* Image Section */}
                        <div className="relative w-full bg-gray-100 overflow-hidden">
                          <div className="relative overflow-hidden group">
                            {/* Main Image */}
                            <Image
                              src={
                                product.images?.main.url || "/placeholder.png"
                              }
                              alt={product.title}
                              width={400}
                              height={500}
                              className={`w-full object-cover transition-opacity duration-700 ease-in-out group-hover:opacity-0 ${
                                inStock
                                  ? "group-hover:opacity-0"
                                  : "opacity-100"
                              }`}
                            />
                            {/* Hover Image */}
                            {inStock && product.images?.main.url && (
                              <Image
                                src={
                                  product.images?.gallery?.[0]?.url ||
                                  "/placeholder.png"
                                }
                                alt={`${product.title} hover`}
                                width={400}
                                height={500}
                                className="absolute top-0 left-0 w-full object-cover transition-opacity duration-1000 ease-in-out opacity-0 group-hover:opacity-100"
                              />
                            )}
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-4 text-left">
                          <div className="flex justify-between">
                            {product.category && (
                              <span
                                className={`inline-block text-xs font-medium px-2 py-1 mb-2 ${
                                  product.category === "Wash & Wear"
                                    ? "bg-blue-100 text-blue-800"
                                    : product.category === "Cotton"
                                      ? "bg-green-100 text-green-800"
                                      : product.category === "Luxury"
                                        ? "bg-green-100 text-green-200"
                                        : product.category ===
                                            "Summer Collection"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : product.category ===
                                              "Winter Collection"
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
                                Save Rs. {product.oldPrice - product.price}
                              </span>
                            )}
                          </div>

                          <h3 className="text-lg font-bold text-gray-800 line-clamp-2">
                            {product.title}
                          </h3>

                          <div className="flex gap-2 text-center justify-center items-center">
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
                                                                               product
                                                                                 ._id
                                                                             ] ??
                                                                               0) ===
                                                                             i
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
