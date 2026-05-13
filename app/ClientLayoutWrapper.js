"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react"; // ✅ ADD THIS

import Navbar from "@/component/Navbar";
import Announcement from "@/component/Announcement";
import WhatsAppButton from "@/component/WhatsAppButton";
import CookieConsent from "@/component/CookieConsent";
import { CartProvider } from "./(frontend)/context/CartContext";
import { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  const hideLayout =
    pathname?.startsWith("/checkoutpage") ||
    pathname?.startsWith("/order-confirmation");

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("welcome_shown");

    if (!hasSeenWelcome) {
      Swal.fire({
        title: "👋 Welcome! TimeTex Fabrics",
        text: "Thanks for visiting our store. Enjoy shopping!",
        icon: "info",
        confirmButtonText: "Start Browsing",
        confirmButtonColor: "#3085d6",
      });

      localStorage.setItem("welcome_shown", "true");
    }
  }, []);

  return (
    <CartProvider>
      {!hideLayout && !isAdminRoute && (
        <>
          <Announcement />
          <Navbar />
        </>
      )}

      <SessionProvider>{children}</SessionProvider>

      <Toaster position="top-right" />

      {!isAdminRoute && <WhatsAppButton />}
      {!isAdminRoute && <CookieConsent />}
    </CartProvider>
  );
}
