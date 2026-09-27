"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type OrderDetail = {
  id: string;
  orderNumber: string;
  status: string;
  total: number | string;
  createdAt: string;

  orderitem: {
    id: string;
    productName: string;
    variantName: string;
    quantity: number;
    totalPrice: number | string;
  }[];

  address: {
    firstName: string;
    lastName: string | null;
    phone: string;
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
  } | null;

  payment: {
    status: string;
    method: string;
  } | null;

  orderstatushistory: {
    id: string;
    status: string;
    createdAt: string;
    note: string | null;
  }[];

  shipment: {
    status: string;
    trackingNumber: string | null;
    courierName: string | null;
    trackingevent: {
      id: string;
      status: string;
      location: string | null;
      description: string | null;
      eventTime: string;
    }[];
  } | null;
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrder() {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load order");
        }

        setOrder(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load order");
      } finally {
        setLoading(false);
      }
    }

    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading order...</p>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error || "Order not found"}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">{order.orderNumber}</h1>
          <p className="text-gray-500 mt-1">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="border rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Order Status</h2>

          <div className="space-y-3">
            {order.orderstatushistory.map((entry) => (
              <div key={entry.id} className="flex justify-between text-sm">
                <span className="font-medium">{entry.status}</span>
                <span className="text-gray-500">
                  {new Date(entry.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {order.shipment && (
          <div className="border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Shipment</h2>

            <p className="text-sm mb-2">
              Status: <span className="font-medium">{order.shipment.status}</span>
            </p>

            {order.shipment.trackingNumber && (
              <p className="text-sm mb-4">
                Tracking Number: {order.shipment.trackingNumber}
                {order.shipment.courierName && ` (${order.shipment.courierName})`}
              </p>
            )}

            <div className="space-y-3">
              {order.shipment.trackingevent.map((event) => (
                <div key={event.id} className="text-sm border-l-2 border-gray-200 pl-4">
                  <p className="font-medium">{event.status}</p>
                  {event.location && <p className="text-gray-500">{event.location}</p>}
                  {event.description && (
                    <p className="text-gray-500">{event.description}</p>
                  )}
                  <p className="text-gray-400">
                    {new Date(event.eventTime).toLocaleString()}
                  </p>
                </div>
              ))}

              {order.shipment.trackingevent.length === 0 && (
                <p className="text-sm text-gray-500">No tracking updates yet.</p>
              )}
            </div>
          </div>
        )}

        <div className="border rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Items</h2>

          <div className="space-y-3">
            {order.orderitem.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.productName} ({item.variantName}) × {item.quantity}
                </span>
                <span>₹{Number(item.totalPrice).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t mt-4 pt-4 flex justify-between font-bold">
            <span>Total</span>
            <span>₹{Number(order.total).toFixed(2)}</span>
          </div>
        </div>

        {order.address && (
          <div className="border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>
            <p className="text-sm">
              {order.address.firstName} {order.address.lastName}
            </p>
            <p className="text-sm">{order.address.phone}</p>
            <p className="text-sm">{order.address.addressLine1}</p>
            <p className="text-sm">
              {order.address.city}, {order.address.state} {order.address.postalCode}
            </p>
          </div>
        )}

        {order.payment && (
          <div className="border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Payment</h2>
            <p className="text-sm">Method: {order.payment.method}</p>
            <p className="text-sm">Status: {order.payment.status}</p>
          </div>
        )}
      </div>
    </main>
  );
}