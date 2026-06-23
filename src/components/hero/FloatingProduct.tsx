
"use client";

import { motion } from "framer-motion";
import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  className?: string;
  delay?: number;
};

export default function FloatingProduct({
  src,
  alt,
  className,
  delay = 0,
}: Props) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 100,
        scale: 0.8,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 1,
        delay,
      }}
      className={className}
    >
      <motion.div
        animate={{
          y: [-10, 10, -10],
          rotate: [-2, 2, -2],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Image
          src={src}
          alt={alt}
          width={220}
          height={220}
          className="drop-shadow-2xl"
        />
      </motion.div>
    </motion.div>
  );
}