"use client";
import { useState } from "react";

export default function CustomerReviews({ product, setProduct }) {
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");

  // ⭐ Calculate average rating
  const avgRating =
    product.reviews?.length > 0
      ? (
          product.reviews.reduce((acc, item) => acc + item.rating, 0) /
          product.reviews.length
        ).toFixed(1)
      : 0;

  // ⭐ Submit Review
  const handleSubmit = (e) => {
    e.preventDefault();

    const newReview = {
      name,
      rating,
      comment,
    };

    setProduct({
      ...product,
      reviews: [newReview, ...(product.reviews || [])],
    });

    setName("");
    setComment("");
    setRating(5);
  };

  return (
    <div className="mt-12 border-t pt-8">
      {/* Header */}
      <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>

      {/* Average Rating */}
      <div className="flex items-center gap-3 mb-6">
        <div className="text-yellow-500 text-lg">
          {"★".repeat(Math.round(avgRating))}
          {"☆".repeat(5 - Math.round(avgRating))}
        </div>
        <span className="text-gray-600 text-sm">
          {avgRating} out of 5 ({product.reviews?.length || 0} reviews)
        </span>
      </div>

      {/* Review List */}
      <div className="space-y-4 mb-8">
        {product.reviews?.length > 0 ? (
          product.reviews.map((rev, i) => (
            <div
              key={i}
              className="border rounded-xl p-4 bg-gray-50"
            >
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-semibold">{rev.name}</h4>
                <span className="text-yellow-500 text-sm">
                  {"★".repeat(rev.rating)}
                  {"☆".repeat(5 - rev.rating)}
                </span>
              </div>
              <p className="text-gray-600 text-sm">{rev.comment}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">
            No reviews yet. Be the first to review!
          </p>
        )}
      </div>

      {/* Add Review Form */}
      <form
        onSubmit={handleSubmit}
        className="border rounded-xl p-6 bg-white shadow-sm"
      >
        <h3 className="font-semibold mb-4">Write a Review</h3>

        {/* Name */}
        <input
          type="text"
          placeholder="Your Name"
          className="w-full border rounded-lg p-2 mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* Rating */}
        <select
          className="w-full border rounded-lg p-2 mb-3"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        >
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} Stars
            </option>
          ))}
        </select>

        {/* Comment */}
        <textarea
          placeholder="Write your review..."
          className="w-full border rounded-lg p-2 mb-3"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
        />

        {/* Submit */}
        <button className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800">
          Submit Review
        </button>
      </form>
    </div>
  );
}