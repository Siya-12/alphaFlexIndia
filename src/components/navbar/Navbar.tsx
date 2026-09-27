"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";

const navLinks = [
  { label: "Products", href: "/#products" },
  { label: "Gallery", href: "/#gallery" },
  { label: "Machines", href: "/#machines" },
  { label: "Why Us", href: "/#why" },
  { label: "Process", href: "/#process" },
  { label: "Clients", href: "/#clients" },
  { label: "Contact", href: "/contact" },
];

/* -----------------------------
   CART ICON
----------------------------- */
function CartIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
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

/* -----------------------------
   USER ICON
----------------------------- */
function UserIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
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

/* -----------------------------
   USER ACCOUNT ICON
----------------------------- */
function AccountIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
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

/* -----------------------------
   LOGOUT ICON
----------------------------- */
function LogoutIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
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

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  /* CART COUNT */
  const [cartCount, setCartCount] = useState(0);

  const accountRef = useRef<HTMLDivElement>(null);

  const { data: session, status } = useSession();

  /* -----------------------------
     USER NAME
  ----------------------------- */
  const userName =
    session?.user?.name ||
    session?.user?.email?.split("@")[0] ||
    "User";

  const userInitial = userName.charAt(0).toUpperCase();

  /* -----------------------------
     READ CART COUNT
  ----------------------------- */
  function updateCartCount() {
    try {
      const storedCart = localStorage.getItem("guestCart");

      if (!storedCart) {
        setCartCount(0);
        return;
      }

      const cart = JSON.parse(storedCart);

      if (!Array.isArray(cart)) {
        setCartCount(0);
        return;
      }

      const totalQuantity = cart.reduce(
        (total: number, item: any) => {
          return total + Number(item.quantity || 0);
        },
        0
      );

      setCartCount(totalQuantity);
    } catch (error) {
      console.error("Failed to read cart count:", error);
      setCartCount(0);
    }
  }

  /* -----------------------------
     CART COUNT LISTENER
  ----------------------------- */
  useEffect(() => {
    updateCartCount();

    const handleCartUpdate = () => {
      updateCartCount();
    };

    window.addEventListener("storage", handleCartUpdate);
    window.addEventListener("cartUpdated", handleCartUpdate);

    /*
      Small interval so the navbar also notices
      cart changes made in the same browser tab.
    */
    const interval = setInterval(() => {
      updateCartCount();
    }, 500);

    return () => {
      window.removeEventListener("storage", handleCartUpdate);
      window.removeEventListener("cartUpdated", handleCartUpdate);
      clearInterval(interval);
    };
  }, []);

  /* -----------------------------
     SHOW HELLO MESSAGE AFTER LOGIN
  ----------------------------- */
  useEffect(() => {
    if (status !== "authenticated" || !session?.user) {
      return;
    }

    const welcomeKey = `alpha-welcome-${
      session.user.email || userName
    }`;

    const alreadyShown = sessionStorage.getItem(welcomeKey);

    if (!alreadyShown) {
      setShowWelcome(true);
      sessionStorage.setItem(welcomeKey, "true");

      const timer = setTimeout(() => {
        setShowWelcome(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [status, session, userName]);

  /* -----------------------------
     CLOSE ACCOUNT DROPDOWN
     WHEN CLICKING OUTSIDE
  ----------------------------- */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target as Node)
      ) {
        setAccountOpen(false);
      }
    }

    if (accountOpen) {
      document.addEventListener(
        "mousedown",
        handleClickOutside
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [accountOpen]);

  /* -----------------------------
     LOGOUT
  ----------------------------- */
  async function handleLogout() {
    setAccountOpen(false);
    setShowWelcome(false);

    await signOut({
      callbackUrl: "/",
    });
  }

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.6,
        ease: "easeOut",
      }}
      className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-ink/5"
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        {/* -----------------------------
            LOGO
        ----------------------------- */}
        <Link
          href="/#home"
          className="flex items-center gap-2"
        >
          <Image
            src="/images/Alpha.png"
            alt="Alpha Flex India"
            width={140}
            height={40}
            priority
            style={{
              width: "140px",
              height: "auto",
            }}
          />
        </Link>

        {/* -----------------------------
            DESKTOP NAVIGATION
        ----------------------------- */}
        <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-ink/80">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="hover:text-indigo transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* -----------------------------
            DESKTOP RIGHT SIDE
        ----------------------------- */}
        <div className="hidden lg:flex items-center gap-4">

          {/* CART */}
          <Link
            href="/cart"
            aria-label="Shopping Cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-ink/5 hover:text-indigo transition-colors"
          >
            <CartIcon />

            {/* CART BADGE */}
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#a946c2] px-1 text-[10px] font-bold text-white shadow-sm">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {/* USER / LOGIN */}
          {status === "loading" ? (
            <div className="h-10 w-10 rounded-full bg-gray-100 animate-pulse" />
          ) : session ? (
            <div
              ref={accountRef}
              className="relative"
            >
              {/* USER AVATAR */}
              <button
                type="button"
                aria-label={`Logged in as ${userName}`}
                onClick={() => {
                  setAccountOpen((value) => !value);
                  setShowWelcome(false);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#a946c2] text-white text-lg font-semibold shadow-sm hover:scale-105 transition-transform"
              >
                {userInitial}
              </button>

              {/* ACCOUNT DROPDOWN */}
              <AnimatePresence>
                {accountOpen && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -8,
                      scale: 0.97,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                      scale: 0.97,
                    }}
                    transition={{
                      duration: 0.18,
                    }}
                    className="absolute right-0 top-14 z-[110] w-[280px] overflow-hidden rounded-2xl bg-white shadow-xl border border-gray-100"
                  >

                    {/* USER INFO */}
                    <div className="px-4 py-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#a946c2] text-white text-lg font-semibold">
                          {userInitial}
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {userName}
                          </p>

                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {session.user?.email}
                          </p>
                        </div>

                      </div>
                    </div>

                    {/* MY ACCOUNT */}
                    <Link
                      href="/account"
                      onClick={() =>
                        setAccountOpen(false)
                      }
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <AccountIcon />
                      <span>My Account</span>
                    </Link>

                    {/* CART */}
                    <Link
                      href="/cart"
                      onClick={() =>
                        setAccountOpen(false)
                      }
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <CartIcon />
                      <span>
                        Shopping Cart
                        {cartCount > 0 && (
                          <span className="ml-2 text-xs text-[#a946c2] font-semibold">
                            ({cartCount})
                          </span>
                        )}
                      </span>
                    </Link>

                    {/* LOGOUT */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                    >
                      <LogoutIcon />
                      <span>Logout</span>
                    </button>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/login"
              aria-label="Login"
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-ink/5 hover:text-indigo transition-colors"
            >
              <UserIcon />
            </Link>
          )}

          {/* CALL NOW */}
          <a
            href="tel:+919811655229"
            className="px-5 py-2.5 rounded-full border border-ink/20 text-sm font-medium text-ink hover:border-indigo hover:text-indigo transition-colors"
          >
            📞 Call Now
          </a>

          {/* GET A QUOTE */}
          <motion.a
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            href="/catalogue/catalogue.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 rounded-full bg-navy text-white text-sm font-semibold hover:bg-indigo transition-colors"
          >
            Get a Quote →
          </motion.a>

        </div>

        {/* -----------------------------
            MOBILE RIGHT SIDE
        ----------------------------- */}
        <div className="lg:hidden flex items-center gap-2">

          {/* MOBILE CART */}
          <Link
            href="/cart"
            aria-label="Shopping Cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-ink/5 transition-colors"
          >
            <CartIcon />

            {/* MOBILE CART BADGE */}
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#a946c2] px-1 text-[10px] font-bold text-white shadow-sm">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {/* MOBILE USER */}
          {status === "loading" ? (
            <div className="h-9 w-9 rounded-full bg-gray-100 animate-pulse" />
          ) : session ? (
            <div
              ref={accountRef}
              className="relative"
            >
              <button
                type="button"
                aria-label={`Logged in as ${userName}`}
                onClick={() => {
                  setAccountOpen((value) => !value);
                  setShowWelcome(false);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#a946c2] text-white text-base font-semibold"
              >
                {userInitial}
              </button>

              {/* MOBILE ACCOUNT DROPDOWN */}
              <AnimatePresence>
                {accountOpen && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -8,
                      scale: 0.97,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                      scale: 0.97,
                    }}
                    transition={{
                      duration: 0.18,
                    }}
                    className="absolute right-0 top-12 z-[110] w-[260px] overflow-hidden rounded-2xl bg-white shadow-xl border border-gray-100"
                  >

                    {/* USER INFO */}
                    <div className="px-4 py-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#a946c2] text-white font-semibold">
                          {userInitial}
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {userName}
                          </p>

                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {session.user?.email}
                          </p>
                        </div>

                      </div>
                    </div>

                    {/* MY ACCOUNT */}
                    <Link
                      href="/account"
                      onClick={() => {
                        setAccountOpen(false);
                        setMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <AccountIcon />
                      <span>My Account</span>
                    </Link>

                    {/* CART */}
                    <Link
                      href="/cart"
                      onClick={() => {
                        setAccountOpen(false);
                        setMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <CartIcon />
                      <span>
                        Shopping Cart
                        {cartCount > 0 && (
                          <span className="ml-2 text-xs text-[#a946c2] font-semibold">
                            ({cartCount})
                          </span>
                        )}
                      </span>
                    </Link>

                    {/* LOGOUT */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                    >
                      <LogoutIcon />
                      <span>Logout</span>
                    </button>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/login"
              aria-label="Login"
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink"
            >
              <UserIcon />
            </Link>
          )}

          {/* MOBILE MENU BUTTON */}
          <button
            aria-label="Menu"
            onClick={() =>
              setMenuOpen((v) => !v)
            }
            className="flex flex-col gap-1.5 p-2"
          >
            <span
              className={`w-6 h-0.5 bg-ink transition-transform ${
                menuOpen
                  ? "rotate-45 translate-y-2"
                  : ""
              }`}
            />

            <span
              className={`w-6 h-0.5 bg-ink transition-opacity ${
                menuOpen
                  ? "opacity-0"
                  : ""
              }`}
            />

            <span
              className={`w-6 h-0.5 bg-ink transition-transform ${
                menuOpen
                  ? "-rotate-45 -translate-y-2"
                  : ""
              }`}
            />
          </button>

        </div>
      </div>

      {/* -----------------------------
          MOBILE MENU
      ----------------------------- */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: "auto",
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
            className="lg:hidden overflow-hidden bg-surface border-t border-ink/5"
          >
            <div className="flex flex-col gap-4 px-6 pb-6 pt-4">

              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-ink/80 font-medium"
                  onClick={() =>
                    setMenuOpen(false)
                  }
                >
                  {link.label}
                </Link>
              ))}

              {/* MOBILE LOGIN */}
              {!session && (
                <Link
                  href="/login"
                  onClick={() =>
                    setMenuOpen(false)
                  }
                  className="text-ink/80 font-medium"
                >
                  Login
                </Link>
              )}

              {/* MOBILE ACCOUNT */}
              {session && (
                <Link
                  href="/account"
                  onClick={() =>
                    setMenuOpen(false)
                  }
                  className="text-ink/80 font-medium"
                >
                  My Account
                </Link>
              )}

              {/* MOBILE CART */}
              <Link
                href="/cart"
                onClick={() =>
                  setMenuOpen(false)
                }
                className="text-ink/80 font-medium"
              >
                Shopping Cart
                {cartCount > 0 && (
                  <span className="ml-2 text-[#a946c2] font-semibold">
                    ({cartCount})
                  </span>
                )}
              </Link>

              {/* MOBILE LOGOUT */}
              {session && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="text-left text-red-600 font-medium"
                >
                  Logout
                </button>
              )}

              {/* GET A QUOTE */}
              <a
                href="https://wa.me/917289009229?text=Hello%20Alpha%20Flex%20India,%20I%20would%20like%20to%20get%20a%20quote%20for%20your%20products."
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 px-6 py-3 rounded-full bg-navy text-white text-sm font-semibold text-center"
              >
                Get a Quote →
              </a>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* -----------------------------
          HELLO POPUP
      ----------------------------- */}
      <AnimatePresence>
        {showWelcome && session && (
          <motion.div
            initial={{
              opacity: 0,
              y: -15,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -15,
              scale: 0.95,
            }}
            transition={{
              duration: 0.25,
            }}
            className="fixed top-24 right-6 z-[100] w-[280px]"
          >
            <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-xl border border-gray-100">

              {/* SMALL AVATAR */}
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#a946c2] text-white text-lg font-semibold">
                {userInitial}
              </div>

              {/* MESSAGE */}
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Hello, {userName}!
                </p>

                <p className="text-xs text-gray-500 mt-0.5">
                  Welcome to Alpha Flex India
                </p>
              </div>

              {/* CLOSE */}
              <button
                type="button"
                onClick={() =>
                  setShowWelcome(false)
                }
                className="ml-auto text-gray-400 hover:text-gray-700 text-lg"
                aria-label="Close"
              >
                ×
              </button>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.nav>
  );
}