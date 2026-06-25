"use client";

import { motion } from "framer-motion";

export default function HeroBackground() {
  return (
    <>
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
        }}
        className="
          absolute
          top-0
          right-0
          w-[500px]
          h-[500px]
          rounded-full
          bg-blue-800/30
          blur-3xl
        "
      />

      <motion.div
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
        }}
        className="
          absolute
          bottom-0
          left-0
          w-[400px]
          h-[400px]
          rounded-full
          bg-blue-400/30
          blur-3xl
        "
      />
    </>
  );
}