"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const stats = [
  { target: 500, suffix: "+", label: "Clients" },
  { target: 14, suffix: "+", label: "Years" },
  { target: 7, suffix: "+", label: "Machines" },
  { target: 100, suffix: "%", label: "Quality" },
];

const brands = [
  {
    label: "Meesho",
    title: "Meesho Branded Products",
    description: "Branded courier bags made to Meesho packaging standards.",
    href: "/meesho",
    image: "/images/meesho.png",
    imageClass: "max-h-[110px] max-w-[110px]",
    dot: "#62094f",
    glow: "rgba(98, 9, 79, 0.10)",
  },
  {
    label: "Valmo",
    title: "Valmo Branded Products",
    description: "Tamper-proof bags built for Valmo logistics.",
    href: "/valmo",
    image: "/images/valmo.png",
    imageClass: "max-h-[90px] max-w-[130px]",
    dot: "#145789",
    glow: "rgba(20, 87, 137, 0.10)",
  },
  {
    label: "Plain",
    title: "Plain Poly Courier Bags",
    description: "Durable plain courier bags for every shipping need.",
    // ✏️ Your old code linked this card to "/valmo" (likely a copy-paste slip).
    // Set this to the correct route.
    href: "/poly",
    image: "/images/poly-courier-bag.png",
    imageClass: "max-h-[130px] max-w-[130px]",
    dot: "#d49a1b",
    glow: "rgba(212, 154, 27, 0.12)",
  },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};


function useCountUp(target: number, active: boolean, duration = 1500) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;

    let start: number | null = null;
    let frame: number;

    const step = (ts: number) => {
      if (start === null) start = ts;

      const progress = Math.min((ts - start) / duration, 1);

      setValue(Math.floor(progress * target));

      if (progress < 1) {
        frame = requestAnimationFrame(step);
      }
    };

    frame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frame);
  }, [active, target, duration]);

  return value;
}

function Stat({
  target,
  suffix,
  label,
  active,
}: {
  target: number;
  suffix: string;
  label: string;
  active: boolean;
}) {
  const value = useCountUp(target, active);

  return (
    <div>
      <div className="text-3xl md:text-4xl font-bold text-ink">
        {value}
        {suffix}
      </div>

      <div className="text-sm text-ink/60 mt-1">{label}</div>
    </div>
  );
}


// ── Puzzle reveal config ──────────────────────────────
const GRID = 5;
const IMAGE_SRC = "/images/heroimage.png";

const puzzleContainer: Variants = {
  hidden: {},

  show: {
    transition: {
      staggerChildren: 0.035,
      delayChildren: 0.2,
    },
  },
};

function puzzleTile(row: number, col: number): Variants {
  const fromX = (col - (GRID - 1) / 2) * 14;
  const fromY = (row - (GRID - 1) / 2) * 14;

  return {
    hidden: {
      opacity: 0,
      scale: 0.5,
      x: fromX,
      y: fromY,
      rotate: (row + col) % 2 === 0 ? -6 : 6,
    },

    show: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
      rotate: 0,

      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };
}

function PuzzleImage() {
  const tiles = Array.from(
    { length: GRID * GRID },
    (_, i) => {
      const row = Math.floor(i / GRID);
      const col = i % GRID;

      return {
        row,
        col,
      };
    }
  );

  return (
    <motion.div
      variants={puzzleContainer}
      initial="hidden"
      animate="show"
      className="grid w-full aspect-square"
      style={{
        gridTemplateColumns: `repeat(${GRID}, 1fr)`,
        gridTemplateRows: `repeat(${GRID}, 1fr)`,
      }}
    >
      {tiles.map(({ row, col }) => (
        <motion.div
          key={`${row}-${col}`}
          variants={puzzleTile(row, col)}
          className="overflow-hidden"
          style={{
            backgroundImage: `url(${IMAGE_SRC})`,
            backgroundSize: `${GRID * 100}% ${GRID * 100}%`,
            backgroundPosition: `${(col / (GRID - 1)) * 100}% ${
              (row / (GRID - 1)) * 100
            }%`,
          }}
        />
      ))}
    </motion.div>
  );
}
// ───────────────────────────────────────────────────────


/* =====================================================
   THREE PRODUCT / BRAND CARDS
   These stay in this same Hero.tsx file,
   but page.tsx will decide where they appear.
===================================================== */

export function BrandedProductsCards() {
  const reduce = useReducedMotion();

  return (
    <section className="w-full bg-surface px-3 py-16 sm:px-6 lg:px-10 lg:py-20">
      {/* Heading (delete this block if you want only the cards) */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="mx-auto mb-12 max-w-2xl text-center"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-[#0E1B4D]/10 bg-white px-4 py-2 text-sm text-[#0E1B4D] shadow-sm">
          <span className="h-2 w-2 rounded-full bg-[#3D3FA1]" />
          Branded Packaging
        </span>
        <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#0E1B4D] sm:text-5xl">
          Shop by{" "}
          <span className="font-serif italic text-[#3D3FA1]">Brand</span>
        </h2>
      </motion.div>

      <motion.div
        variants={container}
        initial={reduce ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-3"
      >
        {brands.map((brand) => (
          <motion.div
            key={brand.title}
            variants={item}
            whileHover={reduce ? undefined : { y: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="h-full"
          >
            <Link
              href={brand.href}
              style={{ "--glow": brand.glow } as React.CSSProperties}
              className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-[#0E1B4D]/10 bg-white p-6 shadow-[0_10px_40px_-20px_rgba(14,27,77,0.25)] transition-all duration-300 hover:border-[#3D3FA1]/30 hover:shadow-[0_30px_60px_-25px_rgba(14,27,77,0.35)]"
            >
              {/* Brand-tinted hover glow */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--glow),transparent_65%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              {/* Label */}
              <div className="relative flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: brand.dot }}
                />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#97A0AC]">
                  {brand.label}
                </span>
              </div>

              {/* Logo / image tile */}
              <div className="relative mt-5 flex h-48 items-center justify-center rounded-2xl bg-[#F7F8FA]">
                <img
                  src={brand.image}
                  alt={brand.title}
                  className={`${brand.imageClass} object-contain transition-transform duration-500 ease-out group-hover:-rotate-2 group-hover:scale-110`}
                />
              </div>

              {/* Text */}
              <div className="relative mt-6 flex flex-1 flex-col">
                <h3 className="text-2xl font-bold leading-tight text-[#0E1B4D]">
                  {brand.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#6B7280]">
                  {brand.description}
                </p>

                <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-[#0E1B4D] px-6 py-3 text-sm font-semibold text-white transition-colors duration-300 group-hover:bg-[#3D3FA1]">
                  Shop Now
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}


/* =====================================================
   HERO
===================================================== */

export default function Hero() {
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsActive, setStatsActive] = useState(false);

  useEffect(() => {
    const el = statsRef.current;

    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsActive(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.3,
      }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="home"
      className="bg-surface overflow-hidden"
    >

      {/* ───────────────── HERO ───────────────── */}

      <div className="max-w-7xl mx-auto px-6 pt-6 pb-20 lg:pt-10 lg:pb-28 grid lg:grid-cols-2 gap-16 items-center">

        {/* LEFT CONTENT */}

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
        >

          <motion.div
            variants={item}
            className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 text-sm font-medium text-ink/70 shadow-sm border border-ink/5"
          >

            <motion.span
              className="w-2 h-2 rounded-full bg-indigo"
              animate={{
                scale: [1, 1.4, 1],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            Premium Flexible Packaging • Made in India

          </motion.div>


          <motion.h1
            variants={item}
            className="mt-6 text-5xl md:text-6xl font-bold text-ink leading-[1.05]"
          >

            Shaping the
            <br />

            <span className="italic font-serif text-indigo">
              Future of Packaging
            </span>

          </motion.h1>


          <motion.p
            variants={item}
            className="mt-6 text-lg text-ink/60 max-w-lg leading-relaxed"
          >
            Alpha Flex India manufactures high-performance LDPE Shrink
            Films, Lamination Films, Tamper Proof Courier Bags and LDPE
            Pouches trusted by India&apos;s leading brands.
          </motion.p>


          <motion.div
            variants={item}
            className="mt-8 flex flex-wrap items-center gap-4"
          >

            <motion.a
              whileHover={{
                scale: 1.04,
              }}
              whileTap={{
                scale: 0.97,
              }}
              href="/catalogue/catalogue.pdf"
              className="px-7 py-3.5 rounded-full bg-navy text-white font-semibold hover:bg-indigo transition-colors inline-flex items-center gap-2"
            >
              Download Catalogue →
            </motion.a>


            <motion.a
              whileHover={{
                scale: 1.04,
              }}
              whileTap={{
                scale: 0.97,
              }}
              href="#products"
              className="px-7 py-3.5 rounded-full border border-ink/20 font-semibold text-ink hover:border-indigo hover:text-indigo transition-colors inline-flex items-center gap-2"
            >
              ▶ View Products
            </motion.a>

          </motion.div>


          <motion.div
            variants={item}
            ref={statsRef}
            className="mt-14 grid grid-cols-4 gap-6 max-w-lg"
          >

            {stats.map((s) => (
              <Stat
                key={s.label}
                {...s}
                active={statsActive}
              />
            ))}

          </motion.div>

        </motion.div>


        {/* RIGHT IMAGE */}

        <div className="relative hidden lg:block">

          <div className="shadow-xl">
            <PuzzleImage />
          </div>


          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
              delay: 1.4,
            }}
            className="absolute -bottom-6 -left-6 bg-navy text-white rounded-2xl px-6 py-4 shadow-lg max-w-[240px]"
          >

            <h4 className="font-semibold flex items-center gap-2">
              🏭 Made in India
            </h4>

            <p className="text-sm text-white/70 mt-1">
              Premium Flexible Packaging Manufacturer
            </p>

          </motion.div>


          <motion.div
            initial={{
              opacity: 0,
              y: -20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
              delay: 1.6,
            }}
            className="absolute top-6 right-6 bg-steel-light text-navy rounded-2xl px-5 py-3 shadow-lg text-center"
          >

            <div className="text-xl font-bold">
              14+
            </div>

            <div className="text-xs font-medium">
              Years Trusted
            </div>

          </motion.div>

        </div>

      </div>

    </section>
  );
}