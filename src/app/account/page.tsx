"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

type OrderSummary = {
  id: string;
  orderNumber: string;
  status: string;
  total: number | string;
  createdAt: string;
};

function UserIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21C4.8 16.9 7.5 14.5 12 14.5C16.5 14.5 19.2 16.9 20 21" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="20" r="1" />
      <circle cx="19" cy="20" r="1" />
      <path d="M3 4H5L7.2 14.2C7.4 15.2 8.3 16 9.3 16H18.4C19.3 16 20.1 15.4 20.4 14.5L22 8H6" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 17L15 12L10 7" />
      <path d="M15 12H3" />
      <path d="M21 3V21" />
    </svg>
  );
}

export default function AccountPage() {
  const router = useRouter();

  const { data: session, status } = useSession();

  // null = still loading, [] = no orders
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);

  /* -----------------------------
     REDIRECT IF NOT LOGGED IN
  ----------------------------- */
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  /* -----------------------------
     LOAD THIS USER'S ORDERS
  ----------------------------- */
  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    let cancelled = false;

    fetch("/api/orders", { cache: "no-store" })
      .then((response) => response.json())
      .then((result) => {
        if (!cancelled) {
          setOrders(result?.success ? result.data : []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setOrders([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [status]);

  /* -----------------------------
     LOGOUT
  ----------------------------- */
  function handleLogout() {
    // Don't leave one person's guest cart behind for the next login
    localStorage.removeItem("guestCart");

    signOut({
      callbackUrl: "/",
    });
  }

  /* -----------------------------
     LOADING
  ----------------------------- */
  if (status === "loading") {
    return (
      <main className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
        <div className="text-gray-500 text-sm">
          Loading your account...
        </div>
      </main>
    );
  }

  /* -----------------------------
     NOT AUTHENTICATED
  ----------------------------- */
  if (!session?.user) {
    return null;
  }

  const userName =
    session.user.name ||
    session.user.email?.split("@")[0] ||
    "User";

  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <main
      className="min-h-screen bg-[#f8f9fc]"
      style={{ fontFamily: "'Times New Roman', Times, serif" }}
    >

      {/* HEADER */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-10">

          <p className="text-sm text-gray-500 mb-2">
            My Account
          </p>

          <h1 className="text-3xl md:text-4xl font-semibold text-[#111827]">
            Welcome, {userName}
          </h1>

          <p className="text-gray-500 mt-2">
            Manage your account and shopping activity.
          </p>

        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="max-w-6xl mx-auto px-6 py-10">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* PROFILE CARD */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            <div className="px-6 py-6 border-b border-gray-100">

              <h2 className="text-lg font-semibold text-gray-900">
                Profile Information
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Your account information.
              </p>

            </div>

            <div className="p-6">

              <div className="flex items-center gap-5">

                {/* AVATAR */}
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#a946c2] text-white text-3xl font-semibold">
                  {userInitial}
                </div>

                {/* DETAILS */}
                <div className="min-w-0">

                  <h3 className="text-xl font-semibold text-gray-900">
                    {userName}
                  </h3>

                  <p className="text-gray-500 mt-1 break-all">
                    {session.user.email}
                  </p>

                </div>

              </div>

              {/* DETAILS BOX */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Full Name
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {userName}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Email Address
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-900 break-all">
                    {session.user.email}
                  </p>
                </div>

              </div>

            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            <div className="px-6 py-6 border-b border-gray-100">

              <h2 className="text-lg font-semibold text-gray-900">
                Quick Actions
              </h2>

            </div>

            <div className="p-3">

              {/* CART */}
              <Link
                href="/cart"
                className="flex items-center gap-4 rounded-xl px-4 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                  <CartIcon />
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Shopping Cart
                  </p>

                  <p className="text-xs text-gray-500 mt-0.5">
                    View your selected products
                  </p>
                </div>
              </Link>

              {/* PROFILE */}
              <div className="flex items-center gap-4 rounded-xl px-4 py-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                  <UserIcon />
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Account
                  </p>

                  <p className="text-xs text-gray-500 mt-0.5">
                    Your profile information
                  </p>
                </div>
              </div>

              {/* LOGOUT */}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-4 rounded-xl px-4 py-4 text-left hover:bg-red-50 transition-colors"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <LogoutIcon />
                </div>

                <div>
                  <p className="text-sm font-semibold text-red-600">
                    Logout
                  </p>

                  <p className="text-xs text-gray-500 mt-0.5">
                    Sign out of your account
                  </p>
                </div>
              </button>

            </div>
          </div>

        </div>

        {/* ORDERS SECTION */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          <div className="px-6 py-6 border-b border-gray-100 flex items-start justify-between gap-4">

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                My Orders
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Track your orders until delivery.
              </p>
            </div>

            {orders && orders.length > 0 && (
              <Link
                href="/orders"
                className="text-sm font-semibold text-[#315cff] hover:underline whitespace-nowrap"
              >
                View all
              </Link>
            )}

          </div>

          {/* LOADING */}
          {orders === null && (
            <div className="px-6 py-12 text-center text-sm text-gray-500">
              Loading your orders...
            </div>
          )}

          {/* EMPTY */}
          {orders !== null && orders.length === 0 && (
            <div className="px-6 py-12 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <CartIcon />
              </div>

              <h3 className="mt-4 text-base font-semibold text-gray-900">
                No orders yet
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Start shopping to see your orders here.
              </p>

              <Link
                href="/#products"
                className="inline-flex mt-5 px-6 py-2.5 rounded-full bg-navy text-white text-sm font-semibold hover:bg-indigo transition-colors"
              >
                Browse Products
              </Link>

            </div>
          )}

          {/* ORDER LIST (latest 5) */}
          {orders !== null && orders.length > 0 && (
            <div className="divide-y divide-gray-100">
              {orders.slice(0, 5).map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {order.orderNumber}
                    </p>

                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      ₹{Number(order.total).toFixed(2)}
                    </p>

                    <span className="inline-block mt-1 text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                      {order.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

        </div>

      </section>

    </main>
  );
}