"use client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
type Product = {
  name: string;
  productvariant?: ProductVariant[];
};

type ProductVariant = {
  size?: string | null;
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
const quantityOptions = [
  25,
  100,
  500,
  1000,
  2000,
  5000,
  10000,
  25000,
  50000,
];

const sizeOptions = [
  { size: "6.5 × 8", price: 0.84, gst: 0.15, total: 0.99 },
  { size: "8 × 10", price: 1.26, gst: 0.23, total: 1.49 },
  { size: "8 × 12", price: 1.42, gst: 0.26, total: 1.68 },
  { size: "9 × 12", price: 1.59, gst: 0.29, total: 1.88 },
  { size: "10 × 12", price: 1.79, gst: 0.32, total: 2.11 },
  { size: "10 × 13", price: 1.91, gst: 0.35, total: 2.26 },
  { size: "10 × 14", price: 2.02, gst: 0.37, total: 2.39 },
  { size: "12 × 14", price: 2.56, gst: 0.46, total: 3.02 },
  { size: "12.5 × 16", price: 2.90, gst: 0.52, total: 3.42 },
  { size: "14 × 18", price: 3.69, gst: 0.67, total: 4.36 },
  { size: "16 × 20", price: 4.74, gst: 0.85, total: 5.59 },
  { size: "20 × 23", price: 7.04, gst: 1.27, total: 8.31 },
  { size: "22 × 24", price: 6.93, gst: 1.25, total: 8.18 },
  { size: "24 × 26", price: 9.06, gst: 1.63, total: 10.69 },
];

export default function MeeshoProductPage() {
const router = useRouter();
  const [quantity, setQuantity] = useState(500);
  const [selectedSize, setSelectedSize] = useState("6.5 × 8");
  const { status } = useSession();

  const selectedSizeData = useMemo(() => {
    return (
      sizeOptions.find((item) => item.size === selectedSize) ??
      sizeOptions[0]
    );
  }, [selectedSize]);

  // Price, GST and Total are taken directly from the pricing table
  const pricePerPiece = selectedSizeData.price;
  const gstPerPiece = selectedSizeData.gst;
  const totalPerPiece = selectedSizeData.total;

  const subtotal = useMemo(() => {
    return quantity * pricePerPiece;
  }, [quantity, pricePerPiece]);

  const gst = useMemo(() => {
    return quantity * gstPerPiece;
  }, [quantity, gstPerPiece]);

  const total = useMemo(() => {
    return quantity * totalPerPiece;
  }, [quantity, totalPerPiece]);

  const formatPrice = (value: number) => {
    return `₹${value.toFixed(2)}`;
  };

 const handleAddToCart = async () => {
  try {
    if (status === "loading") {
      return;
    }

    const response = await fetch("/api/products/meesho-poly-transparent", {
      method: "GET",
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok || !result.success || !result.data) {
      throw new Error(result.message || "Failed to find Meesho product");
    }

    const product = result.data;

    const variant = product.productvariant?.find(
      (item: ProductVariant) => item.size?.trim() === selectedSize.trim()
    );

    if (!variant) {
      throw new Error(`Variant for size ${selectedSize} was not found.`);
    }

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
      const guestCart: GuestCartItem[] = storedCart ? JSON.parse(storedCart) : [];

      const existingItemIndex = guestCart.findIndex(
        (item) => item.variantId === variant.id
      );

      if (existingItemIndex !== -1) {
        guestCart[existingItemIndex].quantity += quantity;
      } else {
        guestCart.push({
          variantId: variant.id,
          quantity,
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
            image: product.productimage?.[0]?.url ?? "/images/meesho-product.png",
          },
          variant: {
            id: variant.id,
            name: variant.name,
            size: variant.size,
            unit: variant.unit,
            sku: variant.sku,
            price: Number(variant.price),
            comparePrice:
              variant.comparePrice !== null ? Number(variant.comparePrice) : null,
          },
        });
      }

      localStorage.setItem("guestCart", JSON.stringify(guestCart));
    }

    window.dispatchEvent(new Event("cart-updated"));
    router.push("/cart");
  } catch (error) {
    console.error("Add to cart error:", error);
    alert(error instanceof Error ? error.message : "Unable to add product to cart.");
  }
};



  return (
    <main
      className="min-h-screen bg-white"
      style={{
        fontFamily: "'Times New Roman', Times, serif",
      }}
    >
      {/* ================= MAIN PRODUCT SECTION ================= */}

      <section className="max-w-7xl mx-auto px-6 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">

          {/* ================= PRODUCT IMAGE ================= */}

          <div>
            <div className="bg-[#eeeeee] rounded-xl overflow-hidden flex items-center justify-center min-h-[550px]">
              <img
                src="/images/meesho-product.png"
                alt="Meesho Poly Transparent Courier Bags"
                className="w-full h-full max-h-[700px] object-contain"
              />
            </div>

            {/* Thumbnail */}

            <div className="mt-4 flex gap-3">
              <div className="w-20 h-20 rounded-lg border-2 border-blue-500 overflow-hidden bg-[#eeeeee]">
                <img
  src="/images/meesho.png"
  alt="Meesho product thumbnail"
  className="w-full h-full object-contain"
/>
              </div>
            </div>
          </div>

          {/* ================= PRODUCT INFORMATION ================= */}

          <div className="bg-white">

            {/* PRODUCT TITLE */}

            <h1 className="text-3xl lg:text-4xl font-semibold text-[#111] leading-tight">
  Meesho Poly Transparent without POD (52 microns)
</h1>

            {/* ================= SIZE ================= */}

            <div className="mt-8">
              <label
                htmlFor="size"
                className="block text-base font-semibold text-[#111] mb-2"
              >
                Size:
              </label>

              <select
                id="size"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full h-12 rounded-lg border border-gray-300 bg-white px-4 text-base text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {sizeOptions.map((item) => (
                  <option key={item.size} value={item.size}>
                    {item.size}
                  </option>
                ))}
              </select>
            </div>

            {/* ================= QUANTITY ================= */}

            <div className="mt-6">
              <label
                htmlFor="quantity"
                className="block text-base font-semibold text-[#111] mb-2"
              >
                Quantity (in PCS):
              </label>

              <select
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full h-12 rounded-lg border border-gray-300 bg-white px-4 text-base text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {quantityOptions.map((qty) => (
                  <option key={qty} value={qty}>
                    {qty}
                  </option>
                ))}
              </select>
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
                      <th className="px-4 py-3 text-left font-semibold">
                        Size
                      </th>

                      <th className="px-4 py-3 text-center font-semibold">
                        Price / Pc
                      </th>

                      <th className="px-4 py-3 text-right font-semibold">
                        Quantity
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td className="px-4 py-3">
                        {selectedSize}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {formatPrice(pricePerPiece)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {quantity.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tbody>

                </table>
              </div>
            </div>

            {/* ================= DELIVERY / POLICY ================= */}

            <div className="mt-5 rounded-xl border border-gray-100 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">

                {/* DELIVERY */}

                <div className="p-5 flex items-center gap-3">
                  <span className="text-2xl">
                    🚚
                  </span>

                  <div>
                    <p className="font-medium text-[#111]">
                      Delivery in
                    </p>

                    <p className="text-sm text-gray-700">
                      3–6 Days
                    </p>
                  </div>
                </div>

                {/* REFUND */}

                <div className="p-5 flex items-center gap-3">
                  <span className="text-2xl">
                    ↩
                  </span>

                  <div>
                    <p className="font-medium text-[#111]">
                      Non Refundable
                    </p>

                    <p className="text-sm text-blue-700 font-medium">
                      Refund Policy
                    </p>
                  </div>
                </div>

                {/* FREE DELIVERY */}

                <div className="p-5 flex items-center gap-3">
                  <span className="text-2xl">
                    ✓
                  </span>

                  <div>
                    <p className="font-medium text-[#111]">
                      Free
                    </p>

                    <p className="text-sm text-gray-700">
                      Delivery
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* ================= CALCULATION ================= */}

            <div className="mt-6 space-y-2">

              {/* PRICE PER PIECE */}

              <div className="flex justify-between text-base">
                <span>
                  Price per piece
                </span>

                <span className="font-medium">
                  {formatPrice(pricePerPiece)}
                </span>
              </div>

              {/* QUANTITY */}

              <div className="flex justify-between text-base">
                <span>
                  Quantity
                </span>

                <span className="font-medium">
                  {quantity.toLocaleString("en-IN")} pcs
                </span>
              </div>

              {/* SUBTOTAL */}

              <div className="flex justify-between text-base">
                <span>
                  Subtotal
                </span>

                <span className="font-medium">
                  {formatPrice(subtotal)}
                </span>
              </div>

              {/* GST */}

              <div className="flex justify-between text-base">
                <span>
                  GST
                </span>

                <span className="font-medium">
                  {formatPrice(gst)}
                </span>
              </div>

              {/* TOTAL */}

              <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between items-center">

                <span className="text-xl font-semibold text-[#111]">
                  Total
                </span>

                <span className="text-2xl font-bold text-green-600">
                  {formatPrice(total)}
                </span>

              </div>

            </div>

            {/* ================= ADD TO CART ================= */}

            <button
              type="button"
              onClick={handleAddToCart}
              className="mt-6 w-full h-12 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium transition"
            >
              Add to Cart
            </button>

            {/* ================= CONTACT ================= */}

            <div className="mt-8">

              <p className="text-lg text-[#111]">
                Need help? Contact us:
              </p>

              <div className="mt-3 flex flex-wrap gap-3">

                {/* WHATSAPP */}

                <a
                  href="https://wa.me/917289009229"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-2.5 text-white font-semibold hover:bg-green-700 transition"
                >
                  WhatsApp
                </a>

                {/* EMAIL */}

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

      {/* ================= SIZE / PRICE TABLE ================= */}

      <section className="max-w-6xl mx-auto px-6 pb-16">

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">

          {/* TABLE TITLE */}

          <div className="bg-[#12355B] px-6 py-5">

            <h2 className="text-2xl font-bold text-white">
              Size & Pricing
            </h2>

            <p className="mt-1 text-sm text-gray-200">
              Price, GST and total price per piece according to size
            </p>

          </div>

          {/* TABLE */}

          <div className="overflow-x-auto">

            <table className="w-full border-collapse">

              {/* HEADER */}

              <thead>
                <tr className="bg-[#EAF1F8] border-b-2 border-[#12355B]">

                  <th className="px-6 py-4 text-left text-sm font-bold text-[#12355B] whitespace-nowrap">
                    S. No.
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-bold text-[#12355B] whitespace-nowrap">
                    Size
                  </th>

                  <th className="px-6 py-4 text-right text-sm font-bold text-[#12355B] whitespace-nowrap">
                    Price (₹)
                  </th>

                  <th className="px-6 py-4 text-right text-sm font-bold text-[#12355B] whitespace-nowrap">
                    GST (₹)
                  </th>

                  <th className="px-6 py-4 text-right text-sm font-bold text-[#12355B] whitespace-nowrap">
                    Total (₹)
                  </th>

                </tr>
              </thead>

              {/* BODY */}

              <tbody>

                {sizeOptions.map((item, index) => (

                  <tr
                    key={item.size}
                    className={`
                      border-b border-gray-200
                      transition-colors duration-200
                      hover:bg-blue-50
                      ${index % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"}
                    `}
                  >

                    {/* S. NO. */}

                    <td className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                      {index + 1}
                    </td>

                    {/* SIZE */}

                    <td className="px-6 py-4 text-left text-sm font-semibold text-[#111827] whitespace-nowrap">
                      {item.size}
                    </td>

                    {/* PRICE */}

                    <td className="px-6 py-4 text-right text-sm text-gray-800 whitespace-nowrap">
                      ₹{item.price.toFixed(2)}
                    </td>

                    {/* GST */}

                    <td className="px-6 py-4 text-right text-sm text-gray-800 whitespace-nowrap">
                      ₹{item.gst.toFixed(2)}
                    </td>

                    {/* TOTAL */}

                    <td className="px-6 py-4 text-right text-sm font-bold text-[#15803D] whitespace-nowrap">
                      ₹{item.total.toFixed(2)}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      </section>

    </main>
  );
}