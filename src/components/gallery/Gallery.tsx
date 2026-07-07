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
];

const AUTOPLAY_MS = 3200;

export default function GallerySection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = galleryImages.length;

  const next = useCallback(() => setActive((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setActive((i) => (i - 1 + count) % count), [count]);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [paused, next]);

  // signed distance from active, wrapped to the shorter direction (-count/2 .. count/2)
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
          <div className="inline-block text-sm font-medium text-navy bg-surface px-4 py-1.5 rounded-full border border-ink/5 mb-4">
            Gallery
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-ink">
            Inside <span className="italic font-serif text-indigo">Our Facility</span>
          </h2>
          <p className="text-ink/60 mt-3 max-w-xl mx-auto">
            A look at the machines, processes, and people behind every roll we produce.
          </p>
        </motion.div>

        {/* STAGE */}
        <div
          className="relative h-[280px] sm:h-[360px] md:h-[420px] flex items-center justify-center"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {galleryImages.map((img, index) => {
            const offset = getOffset(index);
            const isActive = offset === 0;
            const abs = Math.abs(offset);

            // hide cards too far out of view (keeps DOM light + clean on mobile)
            if (abs > 2) return null;

            const size = isActive ? 1 : abs === 1 ? 0.78 : 0.6;
            const xShift = offset * (isActive ? 0 : 130) + offset * abs * 18;

            return (
              <motion.div
                key={img.src}
                className="absolute rounded-2xl overflow-hidden shadow-xl border border-ink/5 bg-surface cursor-pointer"
                style={{
                  width: "min(60vw, 300px)",
                  aspectRatio: "1 / 1",
                }}
                animate={{
                  x: xShift,
                  scale: size,
                  opacity: abs > 2 ? 0 : 1 - abs * 0.28,
                  zIndex: 10 - abs,
                  rotate: isActive ? 0 : offset * 4,
                }}
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
                onClick={() => setActive(index)}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 640px) 60vw, 300px"
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