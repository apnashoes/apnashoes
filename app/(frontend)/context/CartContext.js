"use client";
import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false); // ✅ drawer state

  // ✅ Load cart from cookies on first render
  useEffect(() => {
    const savedCart = Cookies.get("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // ✅ Save cart to cookies + trigger sync event
  useEffect(() => {
    if (cart.length > 0) {
      Cookies.set("cart", JSON.stringify(cart), { expires: 7 });
    } else {
      Cookies.remove("cart");
    }

    // 🔄 sync with other tabs using localStorage
    localStorage.setItem("cart_sync", Date.now().toString());
  }, [cart]);

  // ✅ Listen for cart changes in other tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "cart_sync") {
        const savedCart = Cookies.get("cart");
        setCart(savedCart ? JSON.parse(savedCart) : []);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // ✅ Add product to cart
  const addToCart = (product, openDrawer = true) => {
  setCart((prevCart) => {
    const existing = prevCart.find(
      (item) =>
        item._id === product._id &&
        item.selectedColor?.name === product.selectedColor?.name &&
        item.selectedSize === product.selectedSize
    );

    if (existing) {
      return prevCart.map((item) =>
        item._id === product._id &&
        item.selectedColor?.name === product.selectedColor?.name &&
        item.selectedSize === product.selectedSize
          ? { ...item, qty: item.qty + (product.quantity || 1) }
          : item
      );
    }

    return [
      ...prevCart,
      {
        ...product,
        qty: product.quantity || 1,
        selectedColor: product.selectedColor,
        selectedSize: product.selectedSize,
      },
    ];
  });

  if (openDrawer) setIsCartOpen(true);
};


  // ✅ Remove item
  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== id));
  };

  // ✅ Update quantity
  const updateQty = (id, amount) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item._id === id
            ? { ...item, qty: Math.max(1, item.qty + amount) }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  // ✅ Clear entire cart
  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);


