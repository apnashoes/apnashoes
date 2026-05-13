"use client";

import { SessionProvider } from "next-auth/react";
import { WishlistProvider } from "../app/(frontend)/context/WishlistContext";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <WishlistProvider>{children}</WishlistProvider>
    </SessionProvider>
  );
}
