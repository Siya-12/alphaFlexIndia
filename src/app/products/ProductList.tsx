"use client";

import { useEffect, useState } from "react";

type Variant = {
  id: string;
  name: string;
  size: string | null;
  unit: string | null;
  sku: string;
  price: number;
  comparePrice: number | null;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;

  category: {
    id: string;
    name: string;
    slug: string;
  };

  productimage: {
    id: string;
    url: string;
    altText: string | null;
    sortOrder: number;
  }[];

  productvariant: Variant[];
};

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
  const loadProducts = async () => {
    try {
      const response = await fetch("/api/products");

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const result = await response.json();

      setProducts(result.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  loadProducts();
}, []);

  function addToCart(product: Product, variant: Variant) {
    const existingCart = localStorage.getItem("guestCart");

    const cart = existingCart
      ? JSON.parse(existingCart)
      : [];

    const existingItem = cart.find(
      (item: {
        variantId: string;
      }) => item.variantId === variant.id
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        variantId: variant.id,
        quantity: 1,

        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          image:
            product.productimage[0]?.url || null,
        },

        variant: {
          id: variant.id,
          name: variant.name,
          size: variant.size,
          unit: variant.unit,
          sku: variant.sku,
          price: variant.price,
        },
      });
    }

    localStorage.setItem(
      "guestCart",
      JSON.stringify(cart)
    );

    alert("Product added to cart!");
  }

  if (loading) {
    return (
      <div className="py-20 text-center">
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-20 text-center">
        <p>No products available.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

      {products.map((product) => {
        const variant = product.productvariant[0];

        return (
          <div
            key={product.id}
            className="border rounded-xl overflow-hidden bg-white shadow-sm"
          >

            {/* Image */}
            <div className="h-64 bg-gray-100">

              {product.productimage[0] ? (
                <img
                  src={product.productimage[0].url}
                  alt={
                    product.productimage[0].altText ||
                    product.name
                  }
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}

            </div>

            {/* Details */}
            <div className="p-5">

              <p className="text-sm text-gray-500 mb-1">
                {product.category.name}
              </p>

              <h2 className="text-xl font-semibold">
                {product.name}
              </h2>

              {product.description && (
                <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                  {product.description}
                </p>
              )}

              {variant && (
                <>
                  <div className="mt-4">

                    <p className="font-semibold text-lg">
                     ₹{Number(variant.price).toFixed(2)}
                    </p>

                    {variant.size && (
                      <p className="text-sm text-gray-500">
                        Size: {variant.size}
                      </p>
                    )}

                  </div>

                  <button
                    onClick={() =>
                      addToCart(product, variant)
                    }
                    className="w-full mt-5 bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
                  >
                    Add to Cart
                  </button>
                </>
              )}

            </div>

          </div>
        );
      })}

    </div>
  );
}