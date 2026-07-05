"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Products", href: "#products" },
  { label: "Industries", href: "#industries" },
  { label: "Why Us", href: "#why" },
  { label: "Process", href: "#process" },
  { label: "Clients", href: "#clients" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-ink/5"
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="#home" className="flex items-center gap-2">
          <Image src="/images/Alpha.png" alt="Alpha Flex India" width={140} height={40} priority />
        </Link>

        <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-ink/80">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="hover:text-indigo transition-colors">
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-4">
          
          <a  href="tel:+919811655229"
            className="px-5 py-2.5 rounded-full border border-ink/20 text-sm font-medium text-ink hover:border-indigo hover:text-indigo transition-colors"
          >
            📞 Call Now
          </a>
          <motion.a
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            href="https://wa.me/917289009229?text=Hello%20Alpha%20Flex%20India,%20I%20would%20like%20to%20get%20a%20quote%20for%20your%20products."
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 rounded-full bg-navy text-white text-sm font-semibold hover:bg-indigo transition-colors"
          >
            Get a Quote →
          </motion.a>
        </div>

        <button
          aria-label="Menu"
          onClick={() => setMenuOpen((v) => !v)}
          className="lg:hidden flex flex-col gap-1.5 p-2"
        >
          <span className={`w-6 h-0.5 bg-ink transition-transform ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`w-6 h-0.5 bg-ink transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`w-6 h-0.5 bg-ink transition-transform ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden overflow-hidden bg-surface border-t border-ink/5"
          >
            <div className="flex flex-col gap-4 px-6 pb-6 pt-4">
              {navLinks.map((link) => (
                <a key={link.label} href={link.href} className="text-ink/80 font-medium" onClick={() => setMenuOpen(false)}>
                  {link.label}
                </a>
              ))}
              
               <a href="https://wa.me/917289009229?text=Hello%20Alpha%20Flex%20India,%20I%20would%20like%20to%20get%20a%20quote%20for%20your%20products."
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
    </motion.nav>
  );
}