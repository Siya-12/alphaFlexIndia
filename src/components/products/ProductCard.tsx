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
      hover:border-blue-500
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
          h-64
          object-cover
          group-hover:scale-110
          transition-transform
          duration-500
          "
        />
      </div>

      <div className="p-6">
        <h3
          className="
          text-xl
          font-bold
          text-slate-900
          "
        >
          {title}
        </h3>

        <p
          className="
          text-slate-600
          mt-2
          "
        >
          {description}
        </p>

        <button
          className="
          mt-4
          text-blue-700
          font-semibold
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