"use client";

import { FormEvent, Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

// Change this if your register route lives somewhere else
// (e.g. "/api/auth/register")
const REGISTER_API = "/api/auth/register";

type Mode = "login" | "register";

const inputClass =
  "w-full rounded-xl border border-gray-300 px-5 py-4 text-base outline-none transition focus:border-[#315cff] focus:ring-4 focus:ring-[#315cff]/15";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [mode, setMode] = useState<Mode>("login");

  // shared
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // register only
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  function switchMode(next: Mode) {
    setMode(next);
    setError("");
    setPassword("");
    setConfirmPassword("");
  }

  // ---------------------------------------------
  // Sync guest cart after login / signup
  // ---------------------------------------------
  async function syncGuestCart() {
    const storedCart = localStorage.getItem("guestCart");

    if (!storedCart) {
      return true;
    }

    try {
      const guestItems = JSON.parse(storedCart);

      if (!Array.isArray(guestItems) || guestItems.length === 0) {
        return true;
      }

      const response = await fetch("/api/cart/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: guestItems.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Cart sync failed:", result);
        return false;
      }

      // Only clear guest cart AFTER successful sync
      localStorage.removeItem("guestCart");

      return true;
    } catch (error) {
      console.error("Cart sync error:", error);
      return false;
    }
  }

  // ---------------------------------------------
  // Runs after a successful sign in (login or signup)
  // ---------------------------------------------
  async function finishAuth() {
    const cartSynced = await syncGuestCart();

    if (!cartSynced) {
      setLoading(false);
      setError(
        "Signed in, but we could not sync your cart. Please try again."
      );
      return;
    }

    setLoading(false);
    router.push(callbackUrl);
    router.refresh();
  }

  // ---------------------------------------------
  // LOGIN
  // ---------------------------------------------
  async function handleLogin() {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (!result || result.error) {
      setLoading(false);
      setError("Invalid email or password.");
      return;
    }

    await finishAuth();
  }

  // ---------------------------------------------
  // REGISTER → then auto login
  // ---------------------------------------------
  async function handleRegister() {
    if (password !== confirmPassword) {
      setLoading(false);
      setError("Passwords do not match.");
      return;
    }

    const response = await fetch(REGISTER_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        phone,
        password,
      }),
    });

    let result: { success?: boolean; message?: string } = {};

    try {
      result = await response.json();
    } catch {
      // ignore, handled below
    }

    if (!response.ok || !result.success) {
      setLoading(false);
      setError(result.message || "Could not create your account.");
      return;
    }

    // Account created → sign the user in automatically
    const loginResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (!loginResult || loginResult.error) {
      setLoading(false);
      switchMode("login");
      setError("Account created. Please log in to continue.");
      return;
    }

    await finishAuth();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        await handleRegister();
      } else {
        await handleLogin();
      }
    } catch (err) {
      console.error("Auth error:", err);
      setLoading(false);
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <main className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* LEFT SIDE */}
      <section
        className="relative hidden lg:flex lg:w-[66%] min-h-screen overflow-hidden"
        style={{
          background:
            "repeating-linear-gradient(110deg, #ffffff 0px, #ffffff 70px, #eef8ff 100px, #d9f3ff 135px, #ffffff 175px)",
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_45%,rgba(80,190,255,0.18),transparent_45%)]" />

        <div className="relative z-10 flex min-h-screen w-full flex-col justify-between px-12 py-12 xl:px-16 xl:py-14">
          <div />

          <div className="max-w-3xl pb-8">
            <h2 className="text-4xl font-bold leading-tight text-[#17395f] xl:text-5xl">
              Manage your business
              <br />
              with{" "}
              <span className="text-[#16845e]">Alpha Flex India</span>
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#31516c]">
              Access your Alpha Flex India account to manage your packaging
              requirements, enquiries, orders and business information from
              one place.
            </p>

            <div className="mt-10 flex flex-wrap gap-x-10 gap-y-5 text-lg font-semibold text-[#234b61]">
              <div className="flex items-center gap-3">
                <span className="text-2xl text-[#16845e]">+</span>
                Premium Packaging
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl text-[#16845e]">+</span>
                Easy Management
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl text-[#16845e]">+</span>
                Trusted Service
              </div>
            </div>
          </div>

          <div className="text-sm text-[#49677b]">
            © {new Date().getFullYear()} Alpha Flex India. All rights
            reserved.
          </div>
        </div>
      </section>

      {/* RIGHT SIDE */}
      <section className="flex min-h-screen w-full items-center justify-center bg-white px-6 py-12 lg:w-[34%] lg:px-10">
        <div className="w-full max-w-[520px]">
          {/* Small logo for mobile */}
          <div className="mb-10 flex items-center lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#111d52] text-xl font-bold text-white">
              A
            </div>
            <div className="ml-3">
              <div className="text-2xl font-bold tracking-[0.16em] text-[#111d52]">
                ALPHA
              </div>
              <div className="-mt-1 text-xs font-semibold tracking-[0.25em] text-[#111d52]">
                FLEX INDIA
              </div>
            </div>
          </div>

          <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#111d52] text-3xl font-bold text-white shadow-lg">
            A
          </div>

          <p className="text-lg text-gray-500">
            Welcome to{" "}
            <strong className="text-gray-700">Alpha Flex India</strong>
          </p>

          <h1 className="mt-4 text-4xl font-bold leading-tight text-black xl:text-5xl">
            {isRegister ? (
              <>
                Create your
                <br />
                account
              </>
            ) : (
              <>
                Get started with your
                <br />
                account
              </>
            )}
          </h1>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            {/* Register-only fields */}
            {isRegister && (
              <>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      First name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={inputClass}
                      required
                      minLength={2}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Last name{" "}
                      <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Phone number{" "}
                    <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder={
                  isRegister
                    ? "At least 8 characters"
                    : "Enter your password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                required
                minLength={isRegister ? 8 : undefined}
              />
            </div>

            {/* Confirm password (register only) */}
            {isRegister && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#315cff] px-5 py-4 text-lg font-semibold text-white transition hover:bg-[#244ce8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? isRegister
                  ? "Creating account..."
                  : "Logging in..."
                : isRegister
                ? "Create account"
                : "Continue"}
            </button>
          </form>

          {/* Switch between login / signup */}
          <p className="mt-6 text-center text-base text-gray-600">
            {isRegister ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="font-semibold text-[#315cff] hover:underline"
                >
                  Log in
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className="font-semibold text-[#315cff] hover:underline"
                >
                  Sign up
                </button>
              </>
            )}
          </p>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-sm text-gray-500">or</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl })}
            className="group flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-5 py-4 text-base font-bold text-gray-800 transition-colors duration-200 hover:bg-[#315cff] hover:text-white"
          >
            <span className="text-lg font-bold text-[#4285F4] transition-colors duration-200 group-hover:text-white">
              G
            </span>
            Continue with Google
          </button>

          {/* Terms */}
          <p className="mt-6 text-sm leading-6 text-gray-500">
            By continuing, you agree to our{" "}
            <a href="#" className="text-[#315cff] hover:underline">
              privacy policy
            </a>{" "}
            and{" "}
            <a href="#" className="text-[#315cff] hover:underline">
              terms of use
            </a>
            .
          </p>

          {/* Help box */}
          <div className="mt-8 rounded-2xl bg-gray-50 p-5">
            <p className="text-sm font-medium text-gray-700">
              Need help with Alpha Flex India?
            </p>
            <a
              href="/contact"
              className="mt-2 inline-block text-base font-semibold text-[#315cff] hover:underline"
            >
              Contact us →
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

// useSearchParams() must be inside a Suspense boundary or
// `next build` will fail on this page.
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}