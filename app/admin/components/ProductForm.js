"use client";
import { useState } from "react";
import imageCompression from "browser-image-compression";

export default function ProductForm() {
  const [form, setForm] = useState({
    title: "",
    slug: "",
    price: "",
    oldPrice: "",
    category: "",
    weave: "",
    description: "",
    variants: [],
    images: { mainImage: null, hoverImage: null }, // store compressed File objects
  });

  const [variant, setVariant] = useState({
    colorName: "",
    colorCode: "",
    size: "",
    stock: "",
    sizes: [],
  });

  const [preview, setPreview] = useState({ mainImage: "", hoverImage: "" });
  const [message, setMessage] = useState("");

  // ✅ Slug generator
  const generateSlug = (text) =>
    text.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");

  // ✅ handle normal inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "title") {
      setForm({ ...form, title: value, slug: generateSlug(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // ✅ Add size to variant
  const addSize = () => {
    if (!variant.size || !variant.stock) {
      setMessage("⚠️ Please enter size and stock before adding.");
      return;
    }
    setVariant((prev) => ({
      ...prev,
      sizes: [...prev.sizes, { size: variant.size, stock: parseInt(variant.stock, 10) }],
      size: "",
      stock: "",
    }));
  };

  // ✅ Add variant to product
  const addVariant = () => {
    if (!variant.colorName || variant.sizes.length === 0) {
      setMessage("⚠️ Please add color and at least one size.");
      return;
    }
    setForm((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        { color: { name: variant.colorName, code: variant.colorCode }, sizes: variant.sizes },
      ],
    }));
    setVariant({ colorName: "", colorCode: "", size: "", stock: "", sizes: [] });
  };

  // ✅ handle image select with compression
  const handleImageSelect = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const options = {
        maxSizeMB: 1, // target under 1MB
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);

      // Double-check size (avoid >10MB uploads)
      if (compressedFile.size > 10 * 1024 * 1024) {
        setMessage("❌ Image is still too large after compression. Please choose a smaller file.");
        return;
      }

      setForm((prev) => ({
        ...prev,
        images: { ...prev.images, [type]: compressedFile },
      }));

      setPreview((prev) => ({
        ...prev,
        [type]: URL.createObjectURL(compressedFile),
      }));
    } catch (error) {
      console.error("Image compression error:", error);
      setMessage("❌ Failed to process image. Try another file.");
    }
  };

  // ✅ final submit (App Router compatible)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("⏳ Uploading product...");

    try {
      const formData = new FormData();

      // append text fields
      formData.append("title", form.title);
      formData.append("slug", form.slug);
      formData.append("price", form.price);
      formData.append("oldPrice", form.oldPrice);
      formData.append("category", form.category);
      formData.append("weave", form.weave);
      formData.append("description", form.description);
      formData.append("variants", JSON.stringify(form.variants));

      // append compressed images
      if (form.images.mainImage) formData.append("mainImage", form.images.mainImage);
      if (form.images.hoverImage) formData.append("hoverImage", form.images.hoverImage);

      const res = await fetch("/api/addproducts", {
        method: "POST",
        body: formData, // ✅ multipart handled automatically
      });

      const data = await res.json();
      if (data.success) {
        setMessage("✅ Product saved successfully!");
        setForm({
          title: "",
          slug: "",
          price: "",
          oldPrice: "",
          category: "",
          weave: "",
          description: "",
          variants: [],
          images: { mainImage: null, hoverImage: null },
        });
        setPreview({ mainImage: "", hoverImage: "" });
      } else {
        setMessage("❌ Failed: " + (data.error || data.message));
      }
    } catch (err) {
      setMessage("❌ Error: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl shadow-md">
      {/* Title */}
      <input
        name="title"
        value={form.title}
        onChange={handleChange}
        type="text"
        placeholder="Product Title"
        className="w-full border p-2 rounded"
        required
      />

      {/* Slug */}
      <input
        name="slug"
        value={form.slug}
        type="text"
        placeholder="Slug"
        className="w-full border p-2 rounded bg-gray-100"
        readOnly
      />

      {/* Price */}
      <input
        name="price"
        value={form.price}
        onChange={handleChange}
        type="number"
        placeholder="Price"
        className="w-full border p-2 rounded"
        required
        min="1"
      />

      {/* Old Price */}
      <input
        name="oldPrice"
        value={form.oldPrice}
        onChange={handleChange}
        type="number"
        placeholder="Old Price"
        className="w-full border p-2 rounded"
      />

      {/* Category */}
      <select
        name="category"
        value={form.category}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        required
      >
        <option value="">Select Category</option>
        <option value="Wash & Wear">Wash & Wear</option>
        <option value="Cotton">Cotton</option>
        <option value="Summer Collection">Summer Collection</option>
        <option value="Winter Collection">Winter Collection</option>
        <option value="All Season">All Season</option>
      </select>

      {/* Weave */}
      <select
        name="weave"
        value={form.weave}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        required
      >
        <option value="">Select Weave</option>
        <option value="Plain">Plain</option>
        <option value="Twill">Twill</option>
        <option value="Satin">Satin</option>
      </select>

      {/* Description */}
      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description"
        className="w-full border p-2 rounded"
      ></textarea>

      {/* Variants */}
      <div className="border p-4 rounded space-y-3">
        <h3 className="font-semibold">Add Variants (Color + Sizes + Stock)</h3>

        <input
          type="text"
          placeholder="Color Name (e.g. Black)"
          value={variant.colorName}
          onChange={(e) => setVariant({ ...variant, colorName: e.target.value })}
          className="border p-2 rounded w-full"
        />

        <input
          type="text"
          placeholder="Color Code (e.g. #000000)"
          value={variant.colorCode}
          onChange={(e) => setVariant({ ...variant, colorCode: e.target.value })}
          className="border p-2 rounded w-full"
        />

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Size (e.g. 4 Meter)"
            value={variant.size}
            onChange={(e) => setVariant({ ...variant, size: e.target.value })}
            className="border p-2 rounded w-full"
          />
          <input
            type="number"
            placeholder="Stock"
            value={variant.stock}
            onChange={(e) => setVariant({ ...variant, stock: e.target.value })}
            className="border p-2 rounded w-full"
          />
          <button type="button" onClick={addSize} className="px-3 py-2 bg-gray-600 text-white rounded">
            ➕ Add Size
          </button>
        </div>

        {variant.sizes.length > 0 && (
          <ul className="mt-3 text-sm list-disc pl-5">
            {variant.sizes.map((s, i) => (
              <li key={i}>
                {s.size} → Stock: {s.stock}
              </li>
            ))}
          </ul>
        )}

        <button type="button" onClick={addVariant} className="px-3 py-2 bg-gray-800 text-white rounded mt-2">
          ✅ Add Variant
        </button>

        {form.variants.length > 0 && (
          <ul className="mt-3 space-y-2 text-sm">
            {form.variants.map((v, i) => (
              <li key={i} className="border p-2 rounded">
                <strong>{v.color.name}</strong> ({v.color.code})
                <ul className="pl-5 list-disc">
                  {v.sizes.map((s, j) => (
                    <li key={j}>
                      {s.size} → Stock: {s.stock}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Images */}
      <label className="block text-sm font-medium">Main Image</label>
      <input type="file" onChange={(e) => handleImageSelect(e, "mainImage")} className="w-full border p-2 rounded" />
      {preview.mainImage && <img src={preview.mainImage} className="w-24 h-24 object-cover rounded" />}

      <label className="block text-sm font-medium">Hover Image</label>
      <input type="file" onChange={(e) => handleImageSelect(e, "hoverImage")} className="w-full border p-2 rounded" />
      {preview.hoverImage && <img src={preview.hoverImage} className="w-24 h-24 object-cover rounded" />}

      <button type="submit" className="px-4 py-2 bg-black text-white rounded w-full">
        Add Product
      </button>

      {message && <p className="text-sm text-gray-600">{message}</p>}
    </form>
  );
}
