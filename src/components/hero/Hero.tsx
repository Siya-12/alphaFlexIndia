"use client";

import { motion } from "framer-motion";
import FloatingProduct from "./FloatingProduct";
import HeroBackground from "./HeroBackground";

export default function Hero() {
  return (
    <section
      className="
      relative
      min-h-screen
      overflow-hidden
      bg-white
      flex
      items-center
      "
    >
      <HeroBackground />

      <div
        className="
        max-w-7xl
        mx-auto
        px-6
        lg:px-12
        w-full
        grid
        lg:grid-cols-2
        gap-10
        items-center
        "
      >
        {/* LEFT */}

        <motion.div
          initial={{
            opacity: 0,
            x: -80,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 1,
          }}
        >
          <span
            className="
            inline-block
            px-4
            py-2
            rounded-full
            bg-blue-100
            text-blue-700
            font-medium
            "
          >
            Premium Packaging Solutions
          </span>

          <h1
            className="
            mt-6
            text-5xl
            lg:text-7xl
            font-bold
            text-slate-900
            "
          >
            Shaping the Future
            <br />
            of Packaging
          </h1>

          <p
            className="
            mt-6
            text-lg
            text-slate-600
            max-w-xl
            "
          >
            Alpha Flex India delivers innovative,
            reliable and sustainable packaging
            solutions for modern businesses.
          </p>

          <div className="flex gap-4 mt-8 flex-wrap">
            <button
              className="
              bg-blue-700
              text-white
              px-6
              py-3
              rounded-xl
              hover:scale-105
              transition
              "
            >
              Explore Products
            </button>

            <button
              className="
              border
              border-blue-700
              text-blue-700
              px-6
              py-3
              rounded-xl
              hover:bg-blue-50
              "
            >
              Download Catalogue
            </button>
          </div>
        </motion.div>

        {/* RIGHT */}

        <div className="relative h-[650px] hidden lg:block">
          <FloatingProduct
            src="/logos/Alpha.png"
            alt="Poly Bag"
            delay={0.4}
            className="absolute left-0 top-40"
          />

          <FloatingProduct
           src="/logos/Alpha.png"
            alt="Label Roll"
            delay={0.8}
            className="absolute right-10 top-10"
          />

          <FloatingProduct
            src="/logos/Alpha.png"
            alt="Shrink Film"
            delay={1.2}
            className="absolute right-0 bottom-20"
          />
        </div>
      </div>
    </section>
  );
}