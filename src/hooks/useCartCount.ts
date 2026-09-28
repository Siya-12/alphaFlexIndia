"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

// Pure async helper (no React state inside) so the effect below
// only calls setState from a promise callback.
async function loadCartCount(authenticated: boolean): Promise<number> {
  try {
    if (authenticated) {
      const response = await fetch("/api/cart", { cache: "no-store" });

      if (!response.ok) {
        return 0;
      }

      const result = await response.json();
      return result?.data?.items?.length ?? 0;
    }

    const stored = localStorage.getItem("guestCart");
    const items = stored ? JSON.parse(stored) : [];

    return Array.isArray(items) ? items.length : 0;
  } catch {
    return 0;
  }
}

// Counts distinct products in the cart (not total pieces).
// Logged in  -> reads the database cart
// Guest      -> reads localStorage
export function useCartCount() {
  const { status } = useSession();
  const pathname = usePathname();

  const [count, setCount] = useState(0);
  const [tick, setTick] = useState(0);

  // Reload the count on login/logout, page change, or when the cart changes
  useEffect(() => {
    if (status === "loading") {
      return;
    }

    let cancelled = false;

    loadCartCount(status === "authenticated").then((value) => {
      if (!cancelled) {
        setCount(value);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [status, pathname, tick]);

  // Cart changes anywhere in the app bump `tick`
  useEffect(() => {
    const bump = () => setTick((value) => value + 1);

    window.addEventListener("cart-updated", bump);
    window.addEventListener("cartUpdated", bump);
    window.addEventListener("storage", bump);

    return () => {
      window.removeEventListener("cart-updated", bump);
      window.removeEventListener("cartUpdated", bump);
      window.removeEventListener("storage", bump);
    };
  }, []);

  return count;
}