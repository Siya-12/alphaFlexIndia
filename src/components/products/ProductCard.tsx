"use client";

import Image from "next/image";
import { motion } from "framer-motion";

type ProductCardProps = {
  title: string;
  description: string;
  image: string;
};

export default function ProductCard({
  title,
  description,
  image,
}: ProductCardProps) {
  return (
    <motion.div
      whileHover={{
        y: -10,
        rotate: 1,
      }}
      transition={{
        duration: 0.3,
      }}
      className="
      group
      bg-white
      rounded-3xl
      overflow-hidden
      shadow-md
      hover:shadow-2xl
      border
      border-transparent
      hover:border-indigo
      transition-all
      duration-300
      "
    >
      <div className="overflow-hidden">
        <Image
          src={image}
          alt={title}
          width={500}
          height={300}
          className="
          w-full
          h-40
          sm:h-56
          lg:h-64
          object-cover
          group-hover:scale-110
          transition-transform
          duration-500
          "
        />
      </div>

      <div className="p-4 sm:p-6">
        <h3
          className="
          text-base
          sm:text-xl
          font-bold
          text-ink
          "
        >
          {title}
        </h3>

        <p
          className="
          text-sm
          sm:text-base
          text-ink/60
          mt-2
          line-clamp-2
          sm:line-clamp-none
          "
        >
          {description}
        </p>

        <button
          className="
          mt-4
          text-sm
          sm:text-base
          text-navy
          font-semibold
          hover:text-indigo
          hover:translate-x-2
          transition
          "
        >
          View Details →
        </button>
      </div>
    </motion.div>
  );
}