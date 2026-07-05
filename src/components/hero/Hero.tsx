"use client";

import { useEffect, useRef, useState } from "react";
import { motion, type Variants } from "framer-motion";

const stats = [
  { target: 500, suffix: "+", label: "Clients" },
  { target: 14, suffix: "+", label: "Years" },
  { target: 7, suffix: "+", label: "Machines" },
  { target: 100, suffix: "%", label: "Quality" },
];

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
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [active, target, duration]);
  return value;
}

function Stat({ target, suffix, label, active }: { target: number; suffix: string; label: string; active: boolean }) {
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

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

// ── Puzzle reveal config ──────────────────────────────
const GRID = 5; // 5x5 = 25 tiles
const IMAGE_SRC = "/images/heroimage.png";

const puzzleContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.035, delayChildren: 0.2 },
  },
};

function puzzleTile(row: number, col: number): Variants {
  // pieces converge from slightly randomized directions for a "settling" feel
  const fromX = (col - (GRID - 1) / 2) * 14;
  const fromY = (row - (GRID - 1) / 2) * 14;
  return {
    hidden: { opacity: 0, scale: 0.5, x: fromX, y: fromY, rotate: (row + col) % 2 === 0 ? -6 : 6 },
    show: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
      rotate: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };
}

function PuzzleImage() {
  const tiles = Array.from({ length: GRID * GRID }, (_, i) => {
    const row = Math.floor(i / GRID);
    const col = i % GRID;
    return { row, col };
  });

  return (
    <motion.div
      variants={puzzleContainer}
      initial="hidden"
      animate="show"
      className="grid w-full aspect-square"
      style={{ gridTemplateColumns: `repeat(${GRID}, 1fr)`, gridTemplateRows: `repeat(${GRID}, 1fr)` }}
    >
      {tiles.map(({ row, col }) => (
        <motion.div
          key={`${row}-${col}`}
          variants={puzzleTile(row, col)}
          className="overflow-hidden"
          style={{
            backgroundImage: `url(${IMAGE_SRC})`,
            backgroundSize: `${GRID * 100}% ${GRID * 100}%`,
            backgroundPosition: `${(col / (GRID - 1)) * 100}% ${(row / (GRID - 1)) * 100}%`,
          }}
        />
      ))}
    </motion.div>
  );
}
// ───────────────────────────────────────────────────────

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
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="home" className="bg-surface overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 pt-6 pb-20 lg:pt-10 lg:pb-28 grid lg:grid-cols-2 gap-16 items-center">
        {/* LEFT CONTENT */}
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.div
            variants={item}
            className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 text-sm font-medium text-ink/70 shadow-sm border border-ink/5"
          >
            <motion.span
              className="w-2 h-2 rounded-full bg-indigo"
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
            Premium Flexible Packaging • Made in India
          </motion.div>

          <motion.h1 variants={item} className="mt-6 text-5xl md:text-6xl font-bold text-ink leading-[1.05]">
            Shaping the
            <br />
            <span className="italic font-serif text-indigo">Future of Packaging</span>
          </motion.h1>

          <motion.p variants={item} className="mt-6 text-lg text-ink/60 max-w-lg leading-relaxed">
            Alpha Flex India manufactures high-performance LDPE Shrink Films, Lamination Films,
            Tamper Proof Courier Bags and LDPE Pouches trusted by India&apos;s leading brands.
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-4">
            <motion.a
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              href="/pdfs/catalogue.pdf"
              className="px-7 py-3.5 rounded-full bg-navy text-white font-semibold hover:bg-indigo transition-colors inline-flex items-center gap-2"
            >
              Download Catalogue →
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              href="#products"
              className="px-7 py-3.5 rounded-full border border-ink/20 font-semibold text-ink hover:border-indigo hover:text-indigo transition-colors inline-flex items-center gap-2"
            >
              ▶ View Products
            </motion.a>
          </motion.div>

          <motion.div variants={item} ref={statsRef} className="mt-14 grid grid-cols-4 gap-6 max-w-lg">
            {stats.map((s) => (
              <Stat key={s.label} {...s} active={statsActive} />
            ))}
          </motion.div>
        </motion.div>

        {/* RIGHT IMAGE — hidden on mobile, puzzle-reveal on desktop */}
        <div className="relative hidden lg:block">
          <div className="shadow-xl">
            <PuzzleImage />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="absolute -bottom-6 -left-6 bg-navy text-white rounded-2xl px-6 py-4 shadow-lg max-w-[240px]"
          >
            <h4 className="font-semibold flex items-center gap-2">🏭 Made in India</h4>
            <p className="text-sm text-white/70 mt-1">Premium Flexible Packaging Manufacturer</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.6 }}
            className="absolute top-6 right-6 bg-steel-light text-navy rounded-2xl px-5 py-3 shadow-lg text-center"
          >
            <div className="text-xl font-bold">14+</div>
            <div className="text-xs font-medium">Years Trusted</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}