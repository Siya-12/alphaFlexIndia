"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type CartItem = {
  id: string;
  quantity: number;

  variant: {
    id: string;
    name: string;
    size: string | null;
    unit: string | null;
    sku: string;
    price: number;
    comparePrice: number | null;
    availableQuantity: number;
  };

  product: {
    id: string;
    name: string;
    slug: string;
    productimage: {
      url: string;
      altText: string | null;
    }[];
  };

  total: number;
};

type CartData = {
  id: string | null;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
};

type GuestCartItem = {
  variantId: string;
  quantity: number;

  product: {
    id: string;
    name: string;
    slug: string;
    image: string | null;
  };

  variant: {
    id: string;
    name: string;
    size: string | null;
    unit: string | null;
    comparePrice: number | null;
    sku: string;
    price: number;
  };
};

type CartApiResponse = {
  success: boolean;
  message?: string;
  data?: CartData;
};

export default function CartPage() {
  const router = useRouter();

  const { data: session, status } = useSession();

  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // GUEST CART → UI
  // =====================================================

  function getGuestCart(): CartData {
    const storedCart = localStorage.getItem("guestCart");

    if (!storedCart) {
      return {
        id: null,
        items: [],
        itemCount: 0,
        subtotal: 0,
      };
    }

    const guestItems: GuestCartItem[] = JSON.parse(storedCart);

    const items: CartItem[] = guestItems.map(
      (item: GuestCartItem) => ({
        id: item.variantId,
        quantity: item.quantity,

        variant: {
          id: item.variant.id,
          name: item.variant.name,
          size: item.variant.size,
          unit: item.variant.unit,
          sku: item.variant.sku,
          price: item.variant.price,
          comparePrice: item.variant.comparePrice,
          availableQuantity: 0,
        },

        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,

          productimage: item.product.image
            ? [
                {
                  url: item.product.image,
                  altText: null,
                },
              ]
            : [],
        },

        total:
          Number(item.variant.price) *
          item.quantity,
      })
    );

    const subtotal = items.reduce(
      (sum, item) => sum + item.total,
      0
    );

    const itemCount = items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    return {
      id: null,
      items,
      itemCount,
      subtotal,
    };
  }

  // =====================================================
  // SYNC GUEST CART → DATABASE
  // =====================================================

  async function syncGuestCart() {
    const storedCart =
      localStorage.getItem("guestCart");

    if (!storedCart) {
      return;
    }

    const guestItems: GuestCartItem[] =
      JSON.parse(storedCart);

    if (
      !Array.isArray(guestItems) ||
      guestItems.length === 0
    ) {
      return;
    }

    const response = await fetch(
      "/api/cart/sync",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: guestItems.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        }),
      }
    );

    const text = await response.text();

    if (!text) {
      throw new Error(
        "Cart sync API returned an empty response"
      );
    }

    let result: {
      success?: boolean;
      message?: string;
      data?: {
        cartId?: string;
      };
    };

    try {
      result = JSON.parse(text);
    } catch {
      throw new Error(
        "Cart sync API returned invalid JSON"
      );
    }

    if (!response.ok) {
      throw new Error(
        result.message ||
          "Failed to sync guest cart"
      );
    }

    // IMPORTANT:
    // Only remove guestCart AFTER successful sync
    localStorage.removeItem("guestCart");
  }

  // =====================================================
  // FETCH DATABASE CART
  // =====================================================

  async function fetchDatabaseCart() {
    const response = await fetch(
      "/api/cart",
      {
        method: "GET",
        cache: "no-store",
      }
    );

    const text = await response.text();

    if (!text) {
      throw new Error(
        "Cart API returned an empty response"
      );
    }

    let result: CartApiResponse;

    try {
      result = JSON.parse(text);
    } catch {
      throw new Error(
        "Cart API returned invalid JSON"
      );
    }

    if (!response.ok) {
      throw new Error(
        result.message ||
          "Failed to fetch cart"
      );
    }

    return (
      result.data || {
        id: null,
        items: [],
        itemCount: 0,
        subtotal: 0,
      }
    );
  }

  // =====================================================
  // LOAD CART
  // =====================================================

 const fetchCart = useCallback(async () => {
  try {
    setLoading(true);
    setError("");

    const storedCart = localStorage.getItem("guestCart");

    if (storedCart) {
      const guestItems: GuestCartItem[] =
        JSON.parse(storedCart);

      const items: CartItem[] = guestItems.map(
        (item: GuestCartItem) => ({
          id: item.variantId,
          quantity: item.quantity,

          variant: {
            id: item.variant.id,
            name: item.variant.name,
            size: item.variant.size,
            unit: item.variant.unit,
            sku: item.variant.sku,
            price: item.variant.price,
            comparePrice: null,
            availableQuantity: 0,
          },

          product: {
            id: item.product.id,
            name: item.product.name,
            slug: item.product.slug,

            productimage: item.product.image
              ? [
                  {
                    url: item.product.image,
                    altText: null,
                  },
                ]
              : [],
          },

          total:
            item.variant.price * item.quantity,
        })
      );

      const subtotal = items.reduce(
        (sum, item) => sum + item.total,
        0
      );

      const itemCount = items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      setCart({
        id: null,
        items,
        itemCount,
        subtotal,
      });

      return;
    }

    setCart({
      id: null,
      items: [],
      itemCount: 0,
      subtotal: 0,
    });
  } catch (error) {
    console.error(error);

    setError(
      error instanceof Error
        ? error.message
        : "Failed to load cart"
    );
  } finally {
    setLoading(false);
  }
}, []);

  // =====================================================
  // LOAD WHEN AUTH STATUS IS READY
  // =====================================================

useEffect(() => {
  const loadCart = async () => {
    await Promise.resolve();
    await fetchCart();
  };

  loadCart();
}, [fetchCart]);
  // =====================================================
  // UPDATE GUEST CART QUANTITY
  // =====================================================

  function updateGuestCartQuantity(
    variantId: string,
    change: number
  ) {
    const storedCart =
      localStorage.getItem("guestCart");

    if (!storedCart) {
      return;
    }

    const guestItems: GuestCartItem[] =
      JSON.parse(storedCart);

    const updatedItems = guestItems
      .map((item) => {
        if (item.variantId !== variantId) {
          return item;
        }

        return {
          ...item,
          quantity:
            item.quantity + change,
        };
      })
      .filter(
        (item) => item.quantity > 0
      );

    localStorage.setItem(
      "guestCart",
      JSON.stringify(updatedItems)
    );

    fetchCart();
  }

  // =====================================================
  // PLACE ORDER
  // =====================================================

  async function handlePlaceOrder() {
    try {
      setError("");

      // Check login status
      if (!session?.user) {
        router.push(
          `/login?callbackUrl=${encodeURIComponent(
            "/cart"
          )}`
        );

        return;
      }

      setLoading(true);

      // Make sure guest cart is synced
      const storedCart =
        localStorage.getItem("guestCart");

      if (storedCart) {
        await syncGuestCart();
      }

      // Get latest database cart
      const databaseCart =
        await fetchDatabaseCart();

      if (
        !databaseCart ||
        !databaseCart.id
      ) {
        throw new Error(
          "Database cart was not found"
        );
      }

      if (
        !databaseCart.items ||
        databaseCart.items.length === 0
      ) {
        throw new Error(
          "Cart is empty"
        );
      }

      // Go to checkout
      router.push("/checkout");
    } catch (error) {
      console.error(
        "Place order error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (
    loading ||
    status === "loading"
  ) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading cart...</p>
      </main>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {error}
          </p>

          <button
            onClick={fetchCart}
            className="px-4 py-2 rounded bg-black text-white"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  // =====================================================
  // EMPTY CART
  // =====================================================

  if (
    !cart ||
    cart.items.length === 0
  ) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">
            Your Cart is Empty
          </h1>

          <p className="text-gray-500">
            Add some products to your cart.
          </p>
        </div>
      </main>
    );
  }

  // =====================================================
  // CART UI
  // =====================================================

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold mb-8">
          Your Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* CART ITEMS */}

          <div className="lg:col-span-2 space-y-4">

            {cart.items.map((item) => (
              <div
                key={item.id}
                className="border rounded-xl p-4 flex gap-4"
              >

                {/* IMAGE */}

                <div className="w-28 h-28 bg-gray-100 rounded-lg overflow-hidden">

                  {item.product.productimage[0] ? (
                    <img
                      src={
                        item.product
                          .productimage[0].url
                      }
                      alt={
                        item.product
                          .productimage[0]
                          .altText ||
                        item.product.name
                      }
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}

                </div>

                {/* DETAILS */}

                <div className="flex-1">

                  <h2 className="font-semibold text-lg">
                    {item.product.name}
                  </h2>

                  <p className="text-gray-500">
                    {item.variant.name}
                  </p>

                  {item.variant.size && (
                    <p className="text-sm text-gray-500">
                      Size: {item.variant.size}
                    </p>
                  )}

                  <p className="font-medium mt-2">
                    ₹
                    {Number(
                      item.variant.price
                    ).toFixed(2)}
                  </p>

                  {/* QUANTITY */}

                  <div className="flex items-center gap-3 mt-4">

                    <button
                      onClick={() =>
                        updateGuestCartQuantity(
                          item.variant.id,
                          -1
                        )
                      }
                      className="border rounded px-3 py-1"
                    >
                      −
                    </button>

                    <span>
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        updateGuestCartQuantity(
                          item.variant.id,
                          1
                        )
                      }
                      className="border rounded px-3 py-1"
                    >
                      +
                    </button>

                  </div>

                </div>

                {/* TOTAL */}

                <div className="font-semibold">
                  ₹
                  {Number(
                    item.total
                  ).toFixed(2)}
                </div>

              </div>
            ))}

          </div>

          {/* SUMMARY */}

          <div className="border rounded-xl p-6 h-fit">

            <h2 className="text-xl font-semibold mb-6">
              Order Summary
            </h2>

            <div className="flex justify-between mb-3">

              <span>
                Items ({cart.itemCount})
              </span>

              <span>
                ₹
                {Number(
                  cart.subtotal
                ).toFixed(2)}
              </span>

            </div>

            <div className="border-t pt-4 mt-4 flex justify-between font-bold text-lg">

              <span>
                Total
              </span>

              <span>
                ₹
                {Number(
                  cart.subtotal
                ).toFixed(2)}
              </span>

            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full mt-6 bg-black text-white py-3 rounded-lg disabled:opacity-50"
            >
              {loading
                ? "Processing..."
                : "Place Order"}
            </button>

          </div>

        </div>

      </div>
    </main>
  );
}