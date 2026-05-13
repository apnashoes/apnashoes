"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  // Load from localStorage
  const { data: session } = useSession();

  useEffect(() => {
    const loadWishlist = async () => {
      if (session) {
        // Load from DB
        const res = await fetch("/api/wishlist");
        const data = await res.json();
        setWishlist(data);
      } else {
        // Load from localStorage
        const stored = localStorage.getItem("wishlist");
        if (stored) setWishlist(JSON.parse(stored));
      }
    };

    loadWishlist();
  }, [session]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = async (item) => {
    if (session) {
      await fetch("/api/wishlist", {
        method: "POST",
        body: JSON.stringify({
          productId: item._id,
          name: item.name,
          price: item.price,
          image: item.image,
        }),
      });

      setWishlist((prev) => [...prev, item]);
    } else {
      setWishlist((prev) => {
        const exists = prev.find((i) => i._id === item._id);
        if (exists) return prev;
        return [...prev, item];
      });
    }
  };

  const removeFromWishlist = async (id) => {
    if (session) {
      await fetch("/api/wishlist", {
        method: "DELETE",
        body: JSON.stringify({ productId: id }),
      });
    }

    setWishlist((prev) => prev.filter((item) => item._id !== id));
  };

  const isInWishlist = (id) => {
    return wishlist.some((item) => item._id === id || item.productId === id);
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used inside WishlistProvider");
  }
  return context;
};
