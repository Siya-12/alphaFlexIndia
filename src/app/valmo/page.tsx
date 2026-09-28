"use client";

import { Fragment, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

/* =====================================================
   TYPES
===================================================== */

type GroupKey = "combo" | "small" | "large";

type Pack = {
  id: string;
  group: GroupKey;
  label: string;
  includes: string;
  price: number; // per pack, before GST

  // Used to find the matching variant in the database
  combo?: 1 | 2;
  size?: string; // "10x14" | "16x18"
  pieces?: number;
};

type ProductVariant = {
  id: string;
  name: string;
  sku: string;
  price: number | string;
  size?: string | null;
  unit?: string | null;
  comparePrice?: number | string | null;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  productimage?: { url: string }[];
  productvariant?: ProductVariant[];
};

type GuestCartItem = {
  variantId: string;
  quantity: number;

  product: {
    id: string;
    name: string;
    slug: string;
    image: string;
  };

  variant: {
    id: string;
    name: string;
    sku: string;
    price: number;
    size: string | null;
    unit: string | null;
    comparePrice: number | null;
  };
};

/* =====================================================
   CATALOG  (edit prices / images here)
===================================================== */

const GST_RATE = 0.18;

const GROUPS: Record<GroupKey, { label: string; image: string }> = {
  combo: { label: "Combo", image: "/images/valmo-combo.png" },
  small: { label: 'Small Size (10×14")', image: "/images/valmo-10x14.png" },
  large: { label: 'Large Size (16×18")', image: "/images/valmo-16x18.png" },
};

const PACKS: Pack[] = [
  // ---------- COMBO ----------
  {
    id: "combo-1",
    group: "combo",
    label: "Valmo Branded Combo 1",
    includes: '10×14 (500 pcs), 16×18 (200 pcs) & 4×6" (2 Roll)',
    price: 2473,
    combo: 1,
  },
  {
    id: "combo-2",
    group: "combo",
    label: "Valmo Branded Combo 2",
    includes: '10×14 (3000 pcs), 16×18 (400 pcs) & 4×6" (4 Roll)',
    price: 10915,
    combo: 2,
  },

  // ---------- SMALL (10×14) ----------
  { id: "small-200", group: "small", label: "10×14 Pack of 200", includes: "200 pcs", price: 600, size: "10x14", pieces: 200 },
  { id: "small-500", group: "small", label: "10×14 Pack of 500", includes: "500 pcs", price: 1170, size: "10x14", pieces: 500 },
  { id: "small-1000", group: "small", label: "10×14 Pack of 1000", includes: "1000 pcs", price: 2300, size: "10x14", pieces: 1000 },
  { id: "small-2000", group: "small", label: "10×14 Pack of 2000", includes: "2000 pcs", price: 4600, size: "10x14", pieces: 2000 },
  { id: "small-5000", group: "small", label: "10×14 Pack of 5000", includes: "5000 pcs", price: 11500, size: "10x14", pieces: 5000 },

  // ---------- LARGE (16×18) ----------
  { id: "large-200", group: "large", label: "16×18 Pack of 200", includes: "200 pcs", price: 996, size: "16x18", pieces: 200 },
  { id: "large-500", group: "large", label: "16×18 Pack of 500", includes: "500 pcs", price: 2210, size: "16x18", pieces: 500 },
  { id: "large-1000", group: "large", label: "16×18 Pack of 1000", includes: "1000 pcs", price: 4400, size: "16x18", pieces: 1000 },
  { id: "large-2000", group: "large", label: "16×18 Pack of 2000", includes: "2000 pcs", price: 8860, size: "16x18", pieces: 2000 },
  { id: "large-5000", group: "large", label: "16×18 Pack of 5000", includes: "5000 pcs", price: 22100, size: "16x18", pieces: 5000 },
];

const GROUP_ORDER: GroupKey[] = ["combo", "small", "large"];

/* =====================================================
   HELPERS
===================================================== */

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/×/g, "x")
    .replace(/(\d)\s*x\s*(\d)/g, "$1x$2")
    .replace(/["”″]/g, "");
}

// Finds the database variant that belongs to a pack on this page.
// Works with names like "Valmo 10x14 Pack Of - 500" and
// "Valmo Branded Combo 1: 10x14 (500pcs) ..."
function findVariant(variants: ProductVariant[], pack: Pack) {
  return variants.find((variant) => {
    const text = normalize(`${variant.name ?? ""} | ${variant.size ?? ""}`);
    const isCombo = text.includes("combo");

    if (pack.combo) {
      return isCombo && new RegExp(`combo\\s*${pack.combo}(?!\\d)`).test(text);
    }

    if (isCombo || !pack.size || !text.includes(pack.size)) {
      return false;
    }
const rest = text.split(pack.size).join(" ");
const numbers: string[] = rest.match(/\d+/g) ?? [];

return numbers.includes(String(pack.pieces));
  });
}

const formatPrice = (value: number) =>
  `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/* =====================================================
   PAGE
===================================================== */

export default function ValmoProductPage() {
  const router = useRouter();
  const { status } = useSession();

  const [group, setGroup] = useState<GroupKey>("small");
  const [packId, setPackId] = useState("small-500");
  const [quantity, setQuantity] = useState(1); // number of packs
  const [adding, setAdding] = useState(false);

  const selectedPack = useMemo(
    () => PACKS.find((pack) => pack.id === packId) ?? PACKS[0],
    [packId]
  );

  const groupPacks = useMemo(
    () => PACKS.filter((pack) => pack.group === group),
    [group]
  );

  const subtotal = selectedPack.price * quantity;
  const gst = subtotal * GST_RATE;
  const total = subtotal + gst;

  function selectPack(pack: Pack) {
    setGroup(pack.group);
    setPackId(pack.id);
  }

  function handleGroupChange(nextGroup: GroupKey) {
    setGroup(nextGroup);

    const firstPack = PACKS.find((pack) => pack.group === nextGroup);
    if (firstPack) {
      setPackId(firstPack.id);
    }
  }

  function changeQuantity(next: number) {
    setQuantity(Math.min(999, Math.max(1, next)));
  }

  /* -----------------------------
     ADD TO CART
  ----------------------------- */

  const handleAddToCart = async () => {
    try {
      if (status === "loading" || adding) {
        return;
      }

      setAdding(true);

      const response = await fetch("/api/products?search=Valmo", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to find Valmo products");
      }

      const valmoProducts: Product[] = (result.data ?? []).filter(
        (item: Product) => item.name?.toLowerCase().includes("valmo")
      );

      if (valmoProducts.length === 0) {
        throw new Error("Valmo products were not found in the database.");
      }

      // Works whether the packs are variants of one product
      // or separate products with one variant each.
      const candidates = valmoProducts.flatMap((product) =>
        (product.productvariant ?? []).map((variant) => ({ product, variant }))
      );

      const variants = candidates.map((entry) => entry.variant);
      const variant = findVariant(variants, selectedPack);

      if (!variant) {
        throw new Error(
          `"${selectedPack.label}" was not found in the database.`
        );
      }

      const product = candidates.find(
        (entry) => entry.variant.id === variant.id
      )!.product;

      if (status === "authenticated") {
        // Logged in: save straight to the database cart
        const addResponse = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variantId: variant.id, quantity }),
        });

        const addResult = await addResponse.json();

        if (!addResponse.ok || !addResult.success) {
          throw new Error(addResult.message || "Failed to add product to cart");
        }
      } else {
        // Guest: keep in localStorage until login
        const storedCart = localStorage.getItem("guestCart");
        const guestCart: GuestCartItem[] = storedCart
          ? JSON.parse(storedCart)
          : [];

        const existingIndex = guestCart.findIndex(
          (item) => item.variantId === variant.id
        );

        if (existingIndex !== -1) {
          guestCart[existingIndex].quantity += quantity;
        } else {
          guestCart.push({
            variantId: variant.id,
            quantity,
            product: {
              id: product.id,
              name: product.name,
              slug: product.slug,
              image:
                product.productimage?.[0]?.url ?? GROUPS[selectedPack.group].image,
            },
            variant: {
              id: variant.id,
              name: variant.name,
              size: variant.size ?? null,
              unit: variant.unit ?? null,
              sku: variant.sku,
              price: Number(variant.price),
              comparePrice:
                variant.comparePrice != null
                  ? Number(variant.comparePrice)
                  : null,
            },
          });
        }

        localStorage.setItem("guestCart", JSON.stringify(guestCart));
      }

      window.dispatchEvent(new Event("cart-updated"));
      router.push("/cart");
    } catch (error) {
      console.error("Add to cart error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Unable to add product to cart."
      );
    } finally {
      setAdding(false);
    }
  };

  return (
    <main
      className="min-h-screen bg-white"
      style={{ fontFamily: "'Times New Roman', Times, serif" }}
    >
      {/* ================= MAIN PRODUCT SECTION ================= */}

      <section className="max-w-7xl mx-auto px-6 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">

          {/* ================= PRODUCT IMAGE ================= */}

          <div>
            <div className="bg-[#eeeeee] rounded-xl overflow-hidden flex items-center justify-center min-h-[550px]">
              <img
                key={selectedPack.group}
                src={GROUPS[selectedPack.group].image}
                alt={selectedPack.label}
                className="w-full h-full max-h-[700px] object-contain"
              />
            </div>

            {/* Thumbnails: one per pack type */}

            <div className="mt-4 flex gap-3">
              {GROUP_ORDER.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleGroupChange(key)}
                  aria-label={GROUPS[key].label}
                  className={`w-20 h-20 rounded-lg border-2 overflow-hidden bg-[#eeeeee] ${
                    group === key ? "border-blue-500" : "border-transparent"
                  }`}
                >
                  <img
                    src={GROUPS[key].image}
                    alt={GROUPS[key].label}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* ================= PRODUCT INFORMATION ================= */}

          <div className="bg-white">

            <h1 className="text-3xl lg:text-4xl font-semibold text-[#111] leading-tight">
              Valmo Branded Courier Bags
            </h1>

            {/* ================= TYPE ================= */}

            <div className="mt-8">
              <label
                htmlFor="group"
                className="block text-base font-semibold text-[#111] mb-2"
              >
                Type:
              </label>

              <select
                id="group"
                value={group}
                onChange={(e) => handleGroupChange(e.target.value as GroupKey)}
                className="w-full h-12 rounded-lg border border-gray-300 bg-white px-4 text-base text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {GROUP_ORDER.map((key) => (
                  <option key={key} value={key}>
                    {GROUPS[key].label}
                  </option>
                ))}
              </select>
            </div>

            {/* ================= PACK ================= */}

            <div className="mt-6">
              <label
                htmlFor="pack"
                className="block text-base font-semibold text-[#111] mb-2"
              >
                Pack:
              </label>

              <select
                id="pack"
                value={selectedPack.id}
                onChange={(e) => setPackId(e.target.value)}
                className="w-full h-12 rounded-lg border border-gray-300 bg-white px-4 text-base text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {groupPacks.map((pack) => (
                  <option key={pack.id} value={pack.id}>
                    {pack.label}
                  </option>
                ))}
              </select>

              <p className="mt-2 text-sm text-gray-600">
                Includes: {selectedPack.includes}
              </p>
            </div>

            {/* ================= QUANTITY (PACKS) ================= */}

            <div className="mt-6">
              <label
                htmlFor="quantity"
                className="block text-base font-semibold text-[#111] mb-2"
              >
                Number of packs:
              </label>

              <div className="inline-flex items-center rounded-lg border border-gray-300">
                <button
                  type="button"
                  onClick={() => changeQuantity(quantity - 1)}
                  disabled={quantity <= 1}
                  className="h-12 w-12 text-xl text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                  aria-label="Decrease packs"
                >
                  −
                </button>

                <input
                  id="quantity"
                  type="number"
                  min={1}
                  max={999}
                  value={quantity}
                  onChange={(e) =>
                    changeQuantity(Math.floor(Number(e.target.value)) || 1)
                  }
                  className="h-12 w-20 border-x border-gray-300 text-center text-base outline-none"
                />

                <button
                  type="button"
                  onClick={() => changeQuantity(quantity + 1)}
                  className="h-12 w-12 text-xl text-gray-700 hover:bg-gray-50"
                  aria-label="Increase packs"
                >
                  +
                </button>
              </div>
            </div>

            {/* ================= PRICE ================= */}

            <div className="mt-7">
              <h2 className="text-base font-semibold text-[#111] mb-3">
                Price:
              </h2>

              <div className="overflow-hidden rounded-lg border border-gray-300">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Pack</th>
                      <th className="px-4 py-3 text-center font-semibold">Price / Pack</th>
                      <th className="px-4 py-3 text-right font-semibold">Packs</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td className="px-4 py-3">{selectedPack.label}</td>
                      <td className="px-4 py-3 text-center">
                        {formatPrice(selectedPack.price)}
                      </td>
                      <td className="px-4 py-3 text-right">{quantity}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-2 text-sm text-gray-500">
                Extra 18% GST is applicable.
              </p>
            </div>

            {/* ================= DELIVERY / POLICY ================= */}

            <div className="mt-5 rounded-xl border border-gray-100 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">

                <div className="p-5 flex items-center gap-3">
                  <span className="text-2xl">🚚</span>
                  <div>
                    <p className="font-medium text-[#111]">Delivery in</p>
                    <p className="text-sm text-gray-700">3–6 Days</p>
                  </div>
                </div>

                <div className="p-5 flex items-center gap-3">
                  <span className="text-2xl">↩</span>
                  <div>
                    <p className="font-medium text-[#111]">Non Refundable</p>
                    <p className="text-sm text-blue-700 font-medium">Refund Policy</p>
                  </div>
                </div>

                <div className="p-5 flex items-center gap-3">
                  <span className="text-2xl">✓</span>
                  <div>
                    <p className="font-medium text-[#111]">Free</p>
                    <p className="text-sm text-gray-700">Delivery</p>
                  </div>
                </div>

              </div>
            </div>

            {/* ================= CALCULATION ================= */}

            <div className="mt-6 space-y-2">

              <div className="flex justify-between text-base">
                <span>Price per pack</span>
                <span className="font-medium">{formatPrice(selectedPack.price)}</span>
              </div>

              <div className="flex justify-between text-base">
                <span>Packs</span>
                <span className="font-medium">{quantity}</span>
              </div>

              <div className="flex justify-between text-base">
                <span>Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between text-base">
                <span>GST (18%)</span>
                <span className="font-medium">{formatPrice(gst)}</span>
              </div>

              <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between items-center">
                <span className="text-xl font-semibold text-[#111]">Total</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatPrice(total)}
                </span>
              </div>

            </div>

            {/* ================= ADD TO CART ================= */}

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={adding}
              className="mt-6 w-full h-12 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium transition disabled:opacity-60"
            >
              {adding ? "Adding..." : "Add to Cart"}
            </button>

            {/* ================= CONTACT ================= */}

            <div className="mt-8">
              <p className="text-lg text-[#111]">Need help? Contact us:</p>

              <div className="mt-3 flex flex-wrap gap-3">
                <a
                  href="https://wa.me/917289009229"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-2.5 text-white font-semibold hover:bg-green-700 transition"
                >
                  WhatsApp
                </a>

                <a
                  href="mailto:info@alphaflexindia.com"
                  className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-white font-semibold hover:bg-blue-700 transition"
                >
                  Email
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= ALL PACKS / PRICING TABLE ================= */}

      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">

          <div className="bg-[#12355B] px-6 py-5">
            <h2 className="text-2xl font-bold text-white">Packs & Pricing</h2>
            <p className="mt-1 text-sm text-gray-200">
              Price per pack before GST. Extra 18% GST is applicable. Click a row to select it.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#EAF1F8] border-b-2 border-[#12355B]">
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#12355B] whitespace-nowrap">
                    Pack
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#12355B] whitespace-nowrap">
                    Includes
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-[#12355B] whitespace-nowrap">
                    Price (₹)
                  </th>
                </tr>
              </thead>

              <tbody>
                {GROUP_ORDER.map((key) => (
                  <Fragment key={key}>
                    <tr className="bg-gray-100">
                      <td
                        colSpan={3}
                        className="px-6 py-3 text-sm font-bold text-[#111827]"
                      >
                        {GROUPS[key].label}
                      </td>
                    </tr>

                    {PACKS.filter((pack) => pack.group === key).map((pack) => (
                      <tr
                        key={pack.id}
                        onClick={() => {
                          selectPack(pack);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className={`cursor-pointer border-b border-gray-200 transition-colors hover:bg-blue-50 ${
                          pack.id === selectedPack.id ? "bg-blue-50" : "bg-white"
                        }`}
                      >
                        <td className="px-6 py-4 text-sm font-semibold text-[#111827] whitespace-nowrap">
                          {pack.label}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {pack.includes}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-bold text-[#15803D] whitespace-nowrap">
                          {formatPrice(pack.price)}
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </section>
    </main>
  );
}