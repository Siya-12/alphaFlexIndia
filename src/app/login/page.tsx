"use client";

import {
  FormEvent,
  InputHTMLAttributes,
  MouseEvent,
  ReactNode,
  Suspense,
  useState,
} from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  User,
  type LucideIcon,
} from "lucide-react";

// Change this if your register route lives somewhere else
// (e.g. "/api/auth/register")
const REGISTER_API = "/api/auth/register";

type Mode = "login" | "register";

const inputClass =
  "w-full rounded-xl border border-[#0E1B4D]/10 bg-white py-4 pl-11 pr-4 text-[15px] text-[#0E1B4D] placeholder:text-[#97A0AC] outline-none transition duration-300 hover:border-[#0E1B4D]/25 focus:border-[#3D3FA1] focus:ring-4 focus:ring-[#3D3FA1]/10";

/* =====================================================
   ANIMATION VARIANTS
===================================================== */

const stack: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.25 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/* =====================================================
   SMALL REUSABLE FIELD
===================================================== */

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  icon: LucideIcon;
  optional?: boolean;
  trailing?: ReactNode;
};

function Field({
  id,
  label,
  icon: Icon,
  optional,
  trailing,
  ...props
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-[13px] font-medium text-[#0E1B4D]/75"
      >
        {label}
        {optional && <span className="ml-1 text-[#97A0AC]">(optional)</span>}
      </label>

      <div className="group relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#97A0AC] transition-colors duration-300 group-focus-within:text-[#3D3FA1]" />
        <input
          id={id}
          {...props}
          className={`${inputClass} ${trailing ? "pr-12" : ""}`}
        />
        {trailing && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {trailing}
          </div>
        )}
      </div>
    </div>
  );
}

/* =====================================================
   LOGIN FORM
===================================================== */

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const reduce = useReducedMotion();

  const [mode, setMode] = useState<Mode>("login");

  // shared
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // register only
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  // Cursor-following light on the card border
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const borderGlow = useMotionTemplate`radial-gradient(260px circle at ${mouseX}px ${mouseY}px, rgba(61,63,161,0.9), transparent 70%)`;
  const innerGlow = useMotionTemplate`radial-gradient(440px circle at ${mouseX}px ${mouseY}px, rgba(61,63,161,0.06), transparent 65%)`;

  function handleCardMouseMove(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set(event.clientX - rect.left);
    mouseY.set(event.clientY - rect.top);
  }

  function switchMode(next: Mode) {
    if (next === mode) return;
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

  const passwordToggle = (
    <button
      type="button"
      onClick={() => setShowPassword((v) => !v)}
      aria-label={showPassword ? "Hide password" : "Show password"}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#97A0AC] transition hover:bg-[#0E1B4D]/5 hover:text-[#0E1B4D]"
    >
      {showPassword ? (
        <EyeOff className="h-[18px] w-[18px]" />
      ) : (
        <Eye className="h-[18px] w-[18px]" />
      )}
    </button>
  );

  const expand = {
    initial: { height: 0, opacity: 0 },
    animate: { height: "auto", opacity: 1 },
    exit: { height: 0, opacity: 0 },
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
  };

  return (
    <main className="relative flex min-h-[calc(100vh-88px)] items-center justify-center overflow-hidden bg-[#F7F8FA] px-4 py-14">
      {/* ================= BACKGROUND ================= */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* Fine architectural grid, fading out towards the edges */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(14,27,77,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(14,27,77,0.05) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage:
              "radial-gradient(ellipse at center, black 0%, transparent 70%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 0%, transparent 70%)",
          }}
        />

        {/* One soft, slowly breathing glow behind the card */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="h-[620px] w-[620px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(61,63,161,0.14) 0%, transparent 65%)",
            }}
            animate={
              reduce ? undefined : { scale: [1, 1.14, 1], opacity: [0.8, 1, 0.8] }
            }
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Two hairline rings that slowly pulse outwards */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="absolute h-[760px] w-[760px] rounded-full border border-[#0E1B4D]/[0.06]"
            animate={
              reduce ? undefined : { scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }
            }
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute h-[1040px] w-[1040px] rounded-full border border-[#0E1B4D]/[0.04]"
            animate={
              reduce ? undefined : { scale: [1, 1.04, 1], opacity: [0.5, 1, 0.5] }
            }
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5,
            }}
          />
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="relative z-10 flex w-full max-w-[540px] flex-col items-center">
        {/* Card wrapper: 1px hairline border with a cursor-following light */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 28, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          onMouseMove={handleCardMouseMove}
          className="group relative w-full rounded-[28px] bg-[#0E1B4D]/[0.09] p-px shadow-[0_40px_100px_-40px_rgba(14,27,77,0.28)] transition-shadow duration-500 hover:shadow-[0_50px_110px_-40px_rgba(61,63,161,0.38)]"
        >
          {/* Border light (only the 1px edge shows) */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[28px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: borderGlow }}
          />

          {/* Card surface */}
          <div className="relative overflow-hidden rounded-[27px] bg-white px-7 py-10 sm:px-12 sm:py-12">
            {/* Faint inner light that follows the cursor */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{ background: innerGlow }}
            />

            <motion.div
              variants={stack}
              initial={reduce ? false : "hidden"}
              animate="show"
              className="relative"
            >
              {/* Heading (animates when the mode changes) */}
              <motion.div variants={rise}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={mode}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22 }}
                  >
                    <h1 className="text-4xl font-bold tracking-tight text-[#0E1B4D]">
                      {isRegister ? (
                        <>
                          Create your{" "}
                          <span className="font-serif italic text-[#3D3FA1]">
                            account
                          </span>
                        </>
                      ) : (
                        <>
                          Welcome{" "}
                          <span className="font-serif italic text-[#3D3FA1]">
                            back
                          </span>
                        </>
                      )}
                    </h1>
                    <p className="mt-3 text-[15px] text-[#97A0AC]">
                      {isRegister
                        ? "Sign up to manage your orders and enquiries."
                        : "Log in to continue to Alpha Flex India."}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {/* Mode tabs with sliding underline */}
              <motion.div
                variants={rise}
                className="mt-8 flex gap-8 border-b border-[#0E1B4D]/10"
              >
                {(["login", "register"] as Mode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => switchMode(m)}
                    className={`relative pb-3 text-sm font-semibold transition-colors duration-300 ${
                      mode === m
                        ? "text-[#0E1B4D]"
                        : "text-[#97A0AC] hover:text-[#0E1B4D]"
                    }`}
                  >
                    {m === "login" ? "Log in" : "Sign up"}
                    {mode === m && (
                      <motion.span
                        layoutId="auth-underline"
                        className="absolute -bottom-px left-0 right-0 h-px bg-[#0E1B4D]"
                        transition={{
                          type: "spring",
                          stiffness: 420,
                          damping: 34,
                        }}
                      />
                    )}
                  </button>
                ))}
              </motion.div>

              {/* Form */}
              <motion.form
                variants={rise}
                onSubmit={handleSubmit}
                className="mt-8 flex flex-col"
              >
                {/* Register-only: name + phone */}
                <AnimatePresence initial={false}>
                  {isRegister && (
                    <motion.div
                      key="register-top"
                      {...expand}
                      className="-mx-1 overflow-hidden"
                    >
                      <div className="space-y-5 px-1 pb-5 pt-1">
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                          <Field
                            id="firstName"
                            label="First name"
                            icon={User}
                            type="text"
                            placeholder="First name"
                            autoComplete="given-name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            minLength={2}
                          />
                          <Field
                            id="lastName"
                            label="Last name"
                            icon={User}
                            optional
                            type="text"
                            placeholder="Last name"
                            autoComplete="family-name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                          />
                        </div>

                        <Field
                          id="phone"
                          label="Phone number"
                          icon={Phone}
                          optional
                          type="tel"
                          placeholder="Enter your phone number"
                          autoComplete="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email */}
                <Field
                  id="email"
                  label="Email address"
                  icon={Mail}
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                {/* Password */}
                <div className="mt-5">
                  <Field
                    id="password"
                    label="Password"
                    icon={Lock}
                    type={showPassword ? "text" : "password"}
                    placeholder={
                      isRegister
                        ? "At least 8 characters"
                        : "Enter your password"
                    }
                    autoComplete={
                      isRegister ? "new-password" : "current-password"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={isRegister ? 8 : undefined}
                    trailing={passwordToggle}
                  />
                </div>

                {/* Confirm password (register only) */}
                <AnimatePresence initial={false}>
                  {isRegister && (
                    <motion.div
                      key="register-confirm"
                      {...expand}
                      className="-mx-1 overflow-hidden"
                    >
                      <div className="px-1 pb-1 pt-5">
                        <Field
                          id="confirmPassword"
                          label="Confirm password"
                          icon={Lock}
                          type={showPassword ? "text" : "password"}
                          placeholder="Re-enter your password"
                          autoComplete="new-password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -6, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={reduce || loading ? undefined : { y: -2 }}
                  whileTap={reduce || loading ? undefined : { scale: 0.985 }}
                  className="group/btn relative mt-7 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#0E1B4D] px-5 py-4 text-base font-semibold text-white shadow-lg shadow-[#0E1B4D]/20 transition-colors duration-300 hover:bg-[#3D3FA1] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {/* Light sweep on hover */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/4 -skew-x-12 bg-white/20 opacity-0 transition-all duration-700 ease-out group-hover/btn:translate-x-[520%] group-hover/btn:opacity-100"
                  />
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {isRegister ? "Creating account..." : "Logging in..."}
                    </>
                  ) : (
                    <>
                      {isRegister ? "Create account" : "Continue"}
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                    </>
                  )}
                </motion.button>
              </motion.form>

              {/* Divider */}
              <motion.div
                variants={rise}
                className="my-7 flex items-center gap-4"
              >
                <div className="h-px flex-1 bg-[#0E1B4D]/10" />
                <span className="text-xs text-[#97A0AC]">or</span>
                <div className="h-px flex-1 bg-[#0E1B4D]/10" />
              </motion.div>

              {/* Google */}
              <motion.div variants={rise}>
                <motion.button
                  type="button"
                  onClick={() => signIn("google", { callbackUrl })}
                  whileHover={reduce ? undefined : { y: -2 }}
                  whileTap={reduce ? undefined : { scale: 0.985 }}
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#0E1B4D]/10 bg-white px-5 py-4 text-[15px] font-semibold text-[#0E1B4D] transition-colors duration-300 hover:border-[#3D3FA1]/40 hover:bg-[#F7F8FA]"
                >
                  <svg
                    viewBox="0 0 48 48"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      fill="#FFC107"
                      d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"
                    />
                    <path
                      fill="#FF3D00"
                      d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
                    />
                    <path
                      fill="#4CAF50"
                      d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
                    />
                    <path
                      fill="#1976D2"
                      d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"
                    />
                  </svg>
                  Continue with Google
                </motion.button>
              </motion.div>

              {/* Terms */}
              <motion.p
                variants={rise}
                className="mt-7 text-xs leading-5 text-[#97A0AC]"
              >
                By continuing, you agree to our{" "}
                <a href="#" className="text-[#3D3FA1] hover:underline">
                  privacy policy
                </a>{" "}
                and{" "}
                <a href="#" className="text-[#3D3FA1] hover:underline">
                  terms of use
                </a>
                .
              </motion.p>
            </motion.div>
          </div>
        </motion.div>

        {/* Help link */}
        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-7 text-sm text-[#97A0AC]"
        >
          Need help?{" "}
          <a
            href="/contact"
            className="group inline-flex items-center gap-1 font-semibold text-[#3D3FA1] hover:underline"
          >
            Contact us
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </motion.p>
      </div>
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