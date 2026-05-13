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
    brand: "", // ✅ added
    gender: "", // ✅ added
    description: "",
    variants: [],
    images: { mainImage: null, hoverImage: null },
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
  const [loading, setLoading] = useState(false); // ✅ added
  const [galleryImages, setGalleryImages] = useState([]);

  // ✅ Slug generator
  const generateSlug = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

  // ✅ handle inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "title") {
      setForm({ ...form, title: value, slug: generateSlug(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // ✅ Add size
  const addSize = () => {
    if (!variant.size || !variant.stock) {
      setMessage("⚠️ Please enter size and stock.");
      return;
    }

    setVariant((prev) => ({
      ...prev,
      sizes: [
        ...prev.sizes,
        { size: variant.size, stock: parseInt(variant.stock, 10) },
      ],
      size: "",
      stock: "",
    }));

    setMessage(""); // clear error
  };

  // ✅ Add variant
  const addVariant = () => {
    if (!variant.colorName || variant.sizes.length === 0) {
      setMessage("⚠️ Please add color and at least one size.");
      return;
    }

    setForm((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          color: { name: variant.colorName, code: variant.colorCode },
          sizes: variant.sizes,
        },
      ],
    }));

    setVariant({
      colorName: "",
      colorCode: "",
      size: "",
      stock: "",
      sizes: [],
    });

    setMessage("✅ Variant added");
  };

  // ✅ Image compression
  const handleImageSelect = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });

      setForm((prev) => ({
        ...prev,
        images: { ...prev.images, [type]: compressedFile },
      }));

      setPreview((prev) => ({
        ...prev,
        [type]: URL.createObjectURL(compressedFile),
      }));

      setMessage("");
    } catch (error) {
      setMessage("❌ Image processing failed");
    }
  };

  // ✅ Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("⏳ Uploading product...");

    try {
      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("slug", form.slug);
      formData.append("price", form.price);
      formData.append("oldPrice", form.oldPrice);
      formData.append("category", form.category);
      formData.append("brand", form.brand);
      formData.append("gender", form.gender);
      formData.append("description", form.description);
      formData.append("variants", JSON.stringify(form.variants));

      // ✅ FIXED IMAGES
      if (form.images.mainImage)
        formData.append("images", form.images.mainImage);

      // if (form.images.hoverImage)
      //   formData.append("images", form.images.hoverImage);

      // ✅ Append MULTIPLE images correctly
      galleryImages.forEach((file) => {
        formData.append("gallery", file); // same key!
      });

      // ✅ FIXED WEAVE
      formData.append("weave", form.weave || "mesh");

      const res = await fetch("/api/addproducts", {
        method: "POST",
        body: formData,
      });

      // ✅ SAFE PARSE
      const text = await res.text();
      console.log("SERVER RESPONSE 👇");
      console.log(text);
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        console.error("NOT JSON ❌");
        throw new Error("Server returned HTML instead of JSON");
      }

      if (data.success) {
        setMessage("✅ Product saved!");

        setForm({
          title: "",
          slug: "",
          price: "",
          oldPrice: "",
          category: "",
          brand: "",
          gender: "",
          description: "",
          variants: [],
          images: { mainImage: null, hoverImage: null },
        });

        setPreview({ mainImage: "", hoverImage: "" });
      } else {
        setMessage("❌ " + (data.error || "Failed"));
      }
    } catch (err) {
      setMessage("❌ Error: " + err.message);
    }

    setLoading(false);
  };

  return (
    <>
      <h2 className="text-lg font-medium mb-4">Add New Product</h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-2xl shadow-md"
      >
        {/* Title */}
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Product Title"
          className="w-full border p-2 rounded"
          required
        />

        {/* Slug */}
        <input
          name="slug"
          value={form.slug}
          readOnly
          className="w-full border p-2 rounded bg-gray-100"
        />

        {/* Price */}
        <input
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
          placeholder="Price"
          className="w-full border p-2 rounded"
          required
        />

        {/* Old Price */}
        <input
          name="oldPrice"
          type="number"
          value={form.oldPrice}
          onChange={handleChange}
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
          <option value="Sneakers">Sneakers</option>
          <option value="Sneakers">Skechers</option>
          <option value="Sports">Nike</option>
          <option value="Sports">Sports</option>
          <option value="Formal">Formal</option>
          <option value="Sandals">Sandals</option>
          <option value="Sandals">Slippers</option>
        </select>

        {/* Brand */}
        <input
          name="brand"
          value={form.brand}
          onChange={handleChange}
          placeholder="Brand"
          className="w-full border p-2 rounded"
        />

        {/* Gender */}
        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="">Select Gender</option>
          <option value="Men">Men</option>
          <option value="Women">Women</option>
          <option value="Kids">Kids</option>
          <option value="Unisex">Unisex</option>
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
          <h3 className="font-semibold">Variants</h3>

          <input
            placeholder="Color Name"
            value={variant.colorName}
            onChange={(e) =>
              setVariant({ ...variant, colorName: e.target.value })
            }
            className="border p-2 rounded w-full"
          />

          <input
            placeholder="Color Code"
            value={variant.colorCode}
            onChange={(e) =>
              setVariant({ ...variant, colorCode: e.target.value })
            }
            className="border p-2 rounded w-full"
          />

          <div className="flex gap-2">
            <input
              placeholder="Size (40,41...)"
              value={variant.size}
              onChange={(e) => setVariant({ ...variant, size: e.target.value })}
              className="border p-2 rounded w-full"
            />

            <input
              type="number"
              placeholder="Stock"
              value={variant.stock}
              onChange={(e) =>
                setVariant({ ...variant, stock: e.target.value })
              }
              className="border p-2 rounded w-full"
            />

            <button
              type="button"
              onClick={addSize}
              className="px-3 py-2 bg-gray-600 text-white rounded"
            >
              ➕
            </button>
          </div>

          <button
            type="button"
            onClick={addVariant}
            className="px-3 py-2 bg-gray-800 text-white rounded"
          >
            Add Variant
          </button>
        </div>

        {/* Images */}
        {/* ✅ MAIN IMAGE */}
        <div className="space-y-2">
          <label className="font-medium">Main Image</label>

          <input
            type="file"
            onChange={(e) => handleImageSelect(e, "mainImage")}
          />

          {preview.mainImage && (
            <img
              src={preview.mainImage}
              alt="Main Preview"
              className="w-32 h-32 object-cover rounded border"
            />
          )}
        </div>

        {/* ✅ DRAG & DROP GALLERY */}
        <div
          className="border-2 border-dashed p-6 rounded-lg text-center cursor-pointer"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const files = Array.from(e.dataTransfer.files);
            setGalleryImages((prev) => [...prev, ...files]);
          }}
        >
          <p className="text-gray-500">
            Drag & Drop images here or click below
          </p>

          <input
            type="file"
            multiple
            onChange={(e) =>
              setGalleryImages((prev) => [
                ...prev,
                ...Array.from(e.target.files),
              ])
            }
            className="mt-2"
          />
        </div>

        {/* ✅ GALLERY PREVIEW */}
        <div className="flex flex-wrap gap-3 mt-4">
          {galleryImages.map((file, index) => {
            const previewUrl = URL.createObjectURL(file);

            return (
              <div
                key={index}
                className="relative w-24 h-24 border rounded overflow-hidden"
              >
                <img
                  src={previewUrl}
                  alt="preview"
                  className="w-full h-full object-cover"
                />

                {/* ❌ REMOVE BUTTON */}
                <button
                  type="button"
                  onClick={() =>
                    setGalleryImages((prev) =>
                      prev.filter((_, i) => i !== index),
                    )
                  }
                  className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 rounded"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>

        <button
          disabled={loading}
          className="px-4 py-2 bg-black text-white rounded w-full"
        >
          {loading ? "Uploading..." : "Add Product"}
        </button>

        {message && <p className="text-sm">{message}</p>}
      </form>
    </>
  );
}
