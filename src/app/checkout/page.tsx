"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Script from "next/script";

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

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

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
  const [stateValue, setStateValue] = useState("");
  const [pincode, setPincode] = useState("");

  async function syncGuestCart() {
    const storedCart = localStorage.getItem("guestCart");

    if (!storedCart) {
      return true;
    }

    const guestCart: GuestCartItem[] = JSON.parse(storedCart);

    if (!Array.isArray(guestCart) || guestCart.length === 0) {
      return true;
    }

    const response = await fetch("/api/cart/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: guestCart.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to sync cart");
    }

    localStorage.removeItem("guestCart");
    return true;
  }

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (!session?.user) {
      router.replace(`/login?callbackUrl=${encodeURIComponent("/checkout")}`);
      return;
    }

    async function initializeCheckout() {
      try {
        setLoading(true);
        setError("");
        setSyncing(true);

        await syncGuestCart();

        setSyncing(false);

        const response = await fetch("/api/cart");

        if (!response.ok) {
          throw new Error("Failed to load cart");
        }

        const result = await response.json();

        if (!result.data || result.data.items.length === 0) {
          router.replace("/cart");
          return;
        }

        setCart(result.data);
      } catch (error) {
        console.error(error);
        setError(error instanceof Error ? error.message : "Failed to load checkout");
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

      if (
        !fullName.trim() ||
        !phone.trim() ||
        !address.trim() ||
        !city.trim() ||
        !stateValue.trim() ||
        !pincode.trim()
      ) {
        setError("Please fill in all delivery details.");
        return;
      }

      if (!/^[0-9]{10}$/.test(phone.trim())) {
        setError("Please enter a valid 10-digit phone number.");
        return;
      }

      if (!/^[0-9]{6}$/.test(pincode.trim())) {
        setError("Please enter a valid 6-digit pincode.");
        return;
      }

      setLoading(true);

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          state: stateValue.trim(),
          pincode: pincode.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to create order");
      }

      const { orderId, razorpayOrderId, amount, currency, keyId } = result.data;

      if (!window.Razorpay) {
        throw new Error("Payment gateway failed to load. Please try again.");
      }

      const razorpayInstance = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        name: "Alpha Flex India",
        description: "Order Payment",
        order_id: razorpayOrderId,
        prefill: {
          name: fullName.trim(),
          contact: phone.trim(),
        },
        theme: { color: "#315cff" },
        handler: async function (response: any) {
          try {
            const verifyResponse = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId,
              }),
            });

            const verifyResult = await verifyResponse.json();

            if (!verifyResponse.ok || !verifyResult.success) {
              throw new Error(verifyResult.message || "Payment verification failed");
            }

            router.push(`/orders/${orderId}`);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Payment verification failed");
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      });

      razorpayInstance.open();
    } catch (error) {
      console.error("Checkout error:", error);
      setError(error instanceof Error ? error.message : "Failed to place order");
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>{syncing ? "Preparing your cart..." : "Loading checkout..."}</p>
      </main>
    );
  }

  if (error && !cart) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
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

  if (!cart) {
    return null;
  }

  return (
    <main className="min-h-screen px-6 py-10">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Delivery Details</h2>

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
                  placeholder="State"
                  value={stateValue}
                  onChange={(e) => setStateValue(e.target.value)}
                  required
                  className="border rounded-lg px-4 py-3"
                />
              </div>

              <input
                type="text"
                placeholder="Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                required
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>
          </div>

          <div className="border rounded-xl p-6 h-fit">
            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

            <div className="space-y-3">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>
                    {item.product.name} × {item.quantity}
                  </span>
                  <span>₹{Number(item.total).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t mt-6 pt-4 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹{Number(cart.subtotal).toFixed(2)}</span>
            </div>

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              onClick={handleConfirmOrder}
              disabled={loading}
              className="w-full mt-6 bg-black text-white py-3 rounded-lg disabled:opacity-50"
            >
              {loading ? "Processing..." : "Confirm Order"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}