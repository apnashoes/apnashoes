"use client";
import { useEffect, useState } from "react";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);

  // Search state
  const [search, setSearch] = useState("");

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/getproducts");
      const data = await res.json();
      if (data.success) setProducts(data.products);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Delete
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch("/api/deleteproduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  // Save updates
  const handleEditSave = async () => {
    try {
      let updatedImages = { ...editingProduct.images };

      // Upload main image
      if (editingProduct.newMainImage) {
        const formData = new FormData();
        formData.append("file", editingProduct.newMainImage);
        formData.append(
          "upload_preset",
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
        );

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: "POST", body: formData }
        );
        const data = await res.json();
        updatedImages.mainImage = { url: data.secure_url };
      }

      // Upload hover image
      if (editingProduct.newHoverImage) {
        const formData = new FormData();
        formData.append("file", editingProduct.newHoverImage);
        formData.append(
          "upload_preset",
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
        );

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: "POST", body: formData }
        );
        const data = await res.json();
        updatedImages.hoverImage = { url: data.secure_url };
      }

      // Save product update
      const res = await fetch("/api/updateproducts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingProduct._id,
          updateData: {
            ...editingProduct,
            images: updatedImages,
            title: String(editingProduct.title ?? ""),
            price: Number(editingProduct.price ?? 0),
            oldPrice: editingProduct.oldPrice
              ? Number(editingProduct.oldPrice)
              : null,
            stock: Number(editingProduct.stock ?? 0),
            category: editingProduct.category ?? "",
            weave: editingProduct.weave ?? "",
            sizes: Array.isArray(editingProduct.sizes)
              ? editingProduct.sizes
              : editingProduct.sizes
              ? String(editingProduct.sizes)
                  .split(",")
                  .map((s) => s.trim())
              : [],
          },
        }),
      });

      const result = await res.json();
      if (result.success) {
        setProducts((prev) =>
          prev.map((p) => (p._id === editingProduct._id ? result.product : p))
        );
        setEditingProduct(null);
      }
    } catch (err) {
      console.error("Error updating product:", err);
    }
  };

  if (loading) return <p className="p-4">Loading products...</p>;

  // --- FILTERED PRODUCTS (used for rendering) ---
  const filteredProducts = products.filter((p) => {
    const text = search.toLowerCase().trim();
    if (!text) return true; // when search empty show all
    return (
      (p.title || "").toLowerCase().includes(text) ||
      (p.category || "").toLowerCase().includes(text) ||
      (p.weave || "").toLowerCase().includes(text)
    );
  });

  return (
    <>
      <h2 className="text-2xl font-bold mt-4 mb-4">Product List</h2>

      <div className="p-6 bg-white rounded-2xl shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h2 className="text-xl font-bold">Products ({filteredProducts.length})</h2>

          {/* Search input */}
          <div className="w-full md:w-64">
            <input
              type="text"
              placeholder="Search products (title, category, weave)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 border">Images</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Price</th>
                <th className="p-2 border">Old Price</th>
                <th className="p-2 border">Stock</th>
                <th className="p-2 border">Category</th>
                <th className="p-2 border">Weave</th>
                <th className="p-2 border">Sizes</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="p-2 border flex gap-2 justify-center">
                    <img
                      src={p.images?.mainImage?.url || "/placeholder.png"}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <img
                      src={p.images?.hoverImage?.url || "/placeholder.png"}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </td>
                  <td className="p-2 border">{p.title}</td>
                  <td className="p-2 border">Rs. {p.price}</td>
                  <td className="p-2 border">
                    {p.oldPrice ? `Rs. ${p.oldPrice}` : "-"}
                  </td>
                  <td className="p-2 border">
                    {Array.isArray(p.variants)
                      ? p.variants.reduce((total, variant) => {
                          return (
                            total +
                            (Array.isArray(variant.sizes)
                              ? variant.sizes.reduce(
                                  (s, item) => s + (item.stock || 0),
                                  0
                                )
                              : 0)
                          );
                        }, 0)
                      : p.stock ?? 0}
                  </td>

                  <td className="p-2 border">{p.category}</td>
                  <td className="p-2 border">{p.weave}</td>
                  <td className="p-2 border">
                    {[
                      ...new Set(
                        (p.variants || []).flatMap((v) =>
                          (v.sizes || []).map((s) => s.size)
                        )
                      ),
                    ].join(", ")}
                  </td>

                  <td className="p-2 border space-x-2">
                    <button
                      onClick={() => setEditingProduct(p)}
                      className="px-2 py-1 bg-blue-500 text-white rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="px-2 py-1 bg-red-500 text-white rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-4 text-center text-gray-600">
                    No products match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="grid md:hidden grid-cols-1 gap-4">
          {filteredProducts.map((p) => (
            <div key={p._id} className="border rounded-xl p-4 shadow-sm">
              <div className="flex gap-3">
                <img
                  src={p.images?.mainImage?.url || "/placeholder.png"}
                  className="w-20 h-20 rounded object-cover"
                />
                <img
                  src={p.images?.hoverImage?.url || "/placeholder.png"}
                  className="w-20 h-20 rounded object-cover"
                />
              </div>

              <h3 className="font-bold mt-2">{p.title}</h3>

              <p className="text-sm text-gray-700">Price: Rs. {p.price}</p>
              <p className="text-sm text-gray-700">
                Old Price: {p.oldPrice ? `Rs. ${p.oldPrice}` : "-"}
              </p>
              <p className="text-sm">Stock: {p.stock}</p>
              <p className="text-sm">Category: {p.category}</p>
              <p className="text-sm">Weave: {p.weave}</p>
              <p className="text-sm">
                Sizes: {Array.isArray(p.sizes) && p.sizes.length ? p.sizes.join(", ") : "—"}
              </p>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setEditingProduct(p)}
                  className="px-3 py-1 bg-blue-500 text-white rounded w-full"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p._id)}
                  className="px-3 py-1 bg-red-500 text-white rounded w-full"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {filteredProducts.length === 0 && (
            <div className="p-4 text-center text-gray-600">No products match your search.</div>
          )}
        </div>
      </div>

      {/* Edit modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-3">Edit Product</h3>

            <div className="space-y-3">
              <input
                type="text"
                value={editingProduct.title}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    title: e.target.value,
                  })
                }
                className="border p-2 rounded w-full"
              />

              <input
                type="number"
                value={editingProduct.price}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    price: e.target.value,
                  })
                }
                className="border p-2 rounded w-full"
              />

              <input
                type="number"
                value={editingProduct.oldPrice || ""}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    oldPrice: e.target.value,
                  })
                }
                className="border p-2 rounded w-full"
              />

              <input
                type="number"
                value={editingProduct.stock}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    stock: e.target.value,
                  })
                }
                className="border p-2 rounded w-full"
              />

              {/* category */}
              <select
                value={editingProduct.category}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    category: e.target.value,
                  })
                }
                className="border p-2 rounded w-full"
              >
                <option value="Wash & Wear">Wash & Wear</option>
                <option value="Cotton">Cotton</option>
                <option value="Summer Collection">Summer Collection</option>
                <option value="Winter Collection">Winter Collection</option>
                <option value="All Season">All Season</option>
              </select>

              <input
                type="text"
                value={editingProduct.weave || ""}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    weave: e.target.value,
                  })
                }
                className="border p-2 rounded w-full"
              />

              {/* main image */}
              <div>
                <label>Main Image</label>
                <input
                  type="file"
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      newMainImage: e.target.files[0],
                    })
                  }
                  className="border p-2 rounded w-full"
                />
                {editingProduct.images?.mainImage?.url && (
                  <img
                    src={editingProduct.images.mainImage.url}
                    className="w-20 h-20 mt-2 object-cover rounded"
                  />
                )}
              </div>

              {/* hover image */}
              <div>
                <label>Hover Image</label>
                <input
                  type="file"
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      newHoverImage: e.target.files[0],
                    })
                  }
                  className="border p-2 rounded w-full"
                />
                {editingProduct.images?.hoverImage?.url && (
                  <img
                    src={editingProduct.images.hoverImage.url}
                    className="w-20 h-20 mt-2 object-cover rounded"
                  />
                )}
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <button
                onClick={() => setEditingProduct(null)}
                className="px-3 py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleEditSave}
                className="px-3 py-2 bg-green-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
