"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type CheckoutItem = {
  id: string;
  quantity: number;

  product: {
    name: string;
  };

  total: number | string;
};

type CheckoutCart = {
  items: CheckoutItem[];
  subtotal: number | string;
};

type GuestCartItem = {
  variantId: string;
  quantity: number;
};

export default function CheckoutPage() {
  const router = useRouter();

  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CheckoutCart | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [fullName, setFullName] = useState("");
const [phone, setPhone] = useState("");
const [address, setAddress] = useState("");
const [city, setCity] = useState("");
const [pincode, setPincode] = useState("");

  // --------------------------------------------------
  // 1. Sync guest cart to database
  // --------------------------------------------------

  async function syncGuestCart() {
    const storedCart = localStorage.getItem("guestCart");

    if (!storedCart) {
      return true;
    }

    const guestCart: GuestCartItem[] =
      JSON.parse(storedCart);

    if (
      !Array.isArray(guestCart) ||
      guestCart.length === 0
    ) {
      return true;
    }

    const response = await fetch("/api/cart/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: guestCart.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Failed to sync cart"
      );
    }

    // Only clear guest cart after successful sync
    localStorage.removeItem("guestCart");
    return true;
  }

  // --------------------------------------------------
  // 2. Check authentication + sync + load cart
  // --------------------------------------------------

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    // User is NOT logged in
    if (!session?.user) {
      router.replace(
        `/login?callbackUrl=${encodeURIComponent(
          "/checkout"
        )}`
      );

      return;
    }

    async function initializeCheckout() {
      try {
        setLoading(true);
        setError("");

        // First sync guest cart
        setSyncing(true);

        await syncGuestCart();

        setSyncing(false);

        // Then fetch database cart
        const response = await fetch("/api/cart");

        if (!response.ok) {
          throw new Error("Failed to load cart");
        }

        const result = await response.json();

        if (
          !result.data ||
          result.data.items.length === 0
        ) {
          router.replace("/cart");
          return;
        }

        setCart(result.data);
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load checkout"
        );
      } finally {
        setSyncing(false);
        setLoading(false);
      }
    }

    initializeCheckout();
  }, [status, session, router]);


async function handleConfirmOrder() {
  try {
    setError("");

    // Validate delivery details
    if (
      !fullName.trim() ||
      !phone.trim() ||
      !address.trim() ||
      !city.trim() ||
      !pincode.trim()
    ) {
      setError("Please fill in all delivery details.");
      return;
    }

    // Basic phone validation
    if (!/^[0-9]{10}$/.test(phone.trim())) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    // Basic pincode validation
    if (!/^[0-9]{6}$/.test(pincode.trim())) {
      setError("Please enter a valid 6-digit pincode.");
      return;
    }

    setLoading(true);

    // Razorpay flow will go here

  } catch (error) {
    console.error("Checkout error:", error);

    setError(
      error instanceof Error
        ? error.message
        : "Failed to place order"
    );
  } finally {
    setLoading(false);
  }
}

  // --------------------------------------------------
  // 3. Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>
          {syncing
            ? "Preparing your cart..."
            : "Loading checkout..."}
        </p>
      </main>
    );
  }

  // --------------------------------------------------
  // 4. Error
  // --------------------------------------------------

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-black text-white rounded"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // 5. No cart
  // --------------------------------------------------

  if (!cart) {
    return null;
  }

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold mb-8">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Checkout Details */}

         <form
  onSubmit={handleConfirmOrder}
  className="lg:col-span-2 border rounded-xl p-6"
>

            <h2 className="text-xl font-semibold mb-6">
              Delivery Details
            </h2>

            <div className="space-y-4">

             <input
  type="text"
  placeholder="Full Name"
  value={fullName}
  onChange={(e) => setFullName(e.target.value)}
  required
  className="w-full border rounded-lg px-4 py-3"
/>

              <input
  type="tel"
  placeholder="Phone Number"
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
  required
  className="w-full border rounded-lg px-4 py-3"
/>

             <textarea
  placeholder="Delivery Address"
  rows={4}
  value={address}
  onChange={(e) => setAddress(e.target.value)}
  required
  className="w-full border rounded-lg px-4 py-3"
/>

              <div className="grid grid-cols-2 gap-4">

               <input
  type="text"
  placeholder="City"
  value={city}
  onChange={(e) => setCity(e.target.value)}
  required
  className="border rounded-lg px-4 py-3"
/>

               <input
  type="text"
  placeholder="Pincode"
  value={pincode}
  onChange={(e) => setPincode(e.target.value)}
  required
  className="border rounded-lg px-4 py-3"
/>

              </div>

            </div>
</form>
          </div>

          {/* Order Summary */}

          <div className="border rounded-xl p-6 h-fit">

            <h2 className="text-xl font-semibold mb-6">
              Order Summary
            </h2>

            <div className="space-y-3">

              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between"
                >
                  <span>
                    {item.product.name} × {item.quantity}
                  </span>

                  <span>
                    ₹
                    {Number(item.total).toFixed(2)}
                  </span>
                </div>
              ))}

            </div>

            <div className="border-t mt-6 pt-4 flex justify-between font-bold text-lg">

              <span>Total</span>

              <span>
                ₹
                {Number(cart.subtotal).toFixed(2)}
              </span>

            </div>

            <button
  onClick={handleConfirmOrder}
  disabled={loading}
  className="w-full mt-6 bg-black text-white py-3 rounded-lg disabled:opacity-50"
>
  {loading ? "Processing..." : "Confirm Order"}
</button>

          </div>

        </div>

    </main>
  );
}
