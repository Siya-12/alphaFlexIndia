"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

// leave space for your real square images here
const galleryImages = [
  { src: "/images/gallery/1.jpg", alt: "Manufacturing floor" },
  { src: "/images/gallery/2.jpg", alt: "Quality control" },
  { src: "/images/gallery/3.jpg", alt: "Shrink film production" },
  { src: "/images/gallery/4.jpg", alt: "Finished packaging" },
  { src: "/images/gallery/5.jpg", alt: "Warehouse dispatch" },
  { src: "/images/gallery/6.jpg", alt: "Lamination line" },
  { src: "/images/gallery/7.jpeg", alt: "Courier bags" },
  { src: "/images/gallery/8.jpeg", alt: "Film rolls" },
   { src: "/images/gallery/9.webp", alt: "Quality control" },
  { src: "/images/gallery/10.webp", alt: "Shrink film production" },
  { src: "/images/gallery/11.webp", alt: "Finished packaging" },
  { src: "/images/gallery/5.jpg", alt: "Warehouse dispatch" },
  { src: "/images/gallery/12.webp", alt: "Lamination line" },
  { src: "/images/gallery/13.webp", alt: "Courier bags" },
  { src: "/images/gallery/14.webp", alt: "Film rolls" },
];


const AUTOPLAY_MS = 1000;

export default function GallerySection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 640px)").matches;
});
  const count = galleryImages.length;

  // 7 visible on desktop (active + 3 each side), 5 visible on mobile (active + 2 each side)
  const maxOffset = isMobile ? 2 : 3;

 useEffect(() => {
  const mq = window.matchMedia("(max-width: 640px)");
  const handler = (e: MediaQueryListEvent) => {
    setIsMobile(e.matches);
  };
  mq.addEventListener("change", handler);
  return () => mq.removeEventListener("change", handler);
}, []);

  const next = useCallback(() => setActive((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setActive((i) => (i - 1 + count) % count), [count]);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [paused, next]);

  const getOffset = (index: number) => {
    let diff = index - active;
    if (diff > count / 2) diff -= count;
    if (diff < -count / 2) diff += count;
    return diff;
  };

  return (
    <section className="bg-white py-20 lg:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-14"
        >
        <h2 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
             <em className="not-italic text-[#051c4d]">Gallery</em>{" "}
            
          </h2>
          <p className="text-ink/60 mt-3 max-w-xl mx-auto">
            A look at the machines, processes, and people behind every roll we produce.
          </p>
        </motion.div>

        {/* STAGE */}
        <div
          className="relative h-[220px] sm:h-[320px] md:h-[400px] flex items-center justify-center"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {galleryImages.map((img, index) => {
            const offset = getOffset(index);
            const isActive = offset === 0;
            const abs = Math.abs(offset);

            // only render cards within the visible window (7 desktop / 5 mobile)
            if (abs > maxOffset) return null;

            const size = isActive ? 1 : 1 - abs * 0.13;
            const baseGap = isMobile ? 68 : 108;
            const xShift = offset * baseGap;

            return (
              <motion.div
                key={img.src}
                className="absolute rounded-2xl overflow-hidden shadow-xl border border-ink/5 bg-surface cursor-pointer"
                style={{
                  width: "min(52vw, 260px)",
                  aspectRatio: "1 / 1",
                }}
                animate={{
                  x: xShift,
                  scale: size,
                  opacity: 1,
                  zIndex: 10 - abs,
                  rotate: isActive ? 0 : offset * 3,
                }}
                transition={{ duration: 1, ease: "easeInOut" }}
                onClick={() => setActive(index)}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 640px) 52vw, 260px"
                  className="object-cover"
                />
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.4 }}
                    className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/80 to-transparent p-4"
                  >
                    <p className="text-white text-sm font-medium">{img.alt}</p>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* CONTROLS */}
        <div className="flex items-center justify-center gap-6 mt-10">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={prev}
            aria-label="Previous"
            className="w-11 h-11 rounded-full border border-ink/15 flex items-center justify-center text-ink hover:border-indigo hover:text-indigo transition-colors"
          >
            <ChevronLeft size={20} />
          </motion.button>

          <div className="flex items-center gap-2">
            {galleryImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="relative h-2 rounded-full bg-ink/15 overflow-hidden transition-all duration-300"
                style={{ width: i === active ? 28 : 8 }}
              >
                <AnimatePresence>
                  {i === active && (
                    <motion.span
                      layoutId="activeDot"
                      className="absolute inset-0 bg-navy rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </AnimatePresence>
              </button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={next}
            aria-label="Next"
            className="w-11 h-11 rounded-full border border-ink/15 flex items-center justify-center text-ink hover:border-indigo hover:text-indigo transition-colors"
          >
            <ChevronRight size={20} />
          </motion.button>
        </div>
      </div>
    </section>
  );
}