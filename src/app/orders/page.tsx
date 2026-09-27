"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  total: number | string;
  createdAt: string;
  orderitem: { id: string; productName: string; quantity: number }[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        const response = await fetch("/api/orders");
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load orders");
        }

        setOrders(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load orders");
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading orders...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  if (orders.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>You have no orders yet.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Orders</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block border rounded-xl p-5 hover:border-black transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {order.orderitem.length} item(s)
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-semibold">₹{Number(order.total).toFixed(2)}</p>
                  <span className="inline-block mt-2 text-xs font-medium px-3 py-1 rounded-full bg-gray-100">
                    {order.status}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}