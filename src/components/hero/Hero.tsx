"use client";

import { motion } from "framer-motion";
import HeroBackground from "./HeroBackground";

export default function Hero() {
  return (
    <section
      className="
      relative
      min-h-[85vh]
      py-10
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
        px-4
        sm:px-6
        lg:px-12
        w-full
        grid
        grid-cols-1
        lg:grid-cols-2
        gap-12
        items-center
        "
      >
        {/* LEFT SECTION */}

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
          className="text-center lg:text-left"
        >

          {/* Tagline */}

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

          {/* Heading */}

          <h1
            className="
            mt-6
            text-4xl
            sm:text-5xl
            lg:text-7xl
            font-bold
            leading-tight
            text-slate-900
            "
          >
            Shaping the Future
            <br />
            of Packaging
          </h1>

          {/* Description */}

          <p
            className="
            mt-6
            text-base
            sm:text-lg
            text-slate-600
            max-w-xl
            mx-auto
            lg:mx-0
            "
          >
            Alpha Flex India delivers innovative,
            reliable and sustainable packaging
            solutions for modern businesses.
            We specialize in courier bags,
            labels, shrink films and custom
            packaging products.
          </p>

          {/* CTA Buttons */}

          <div
            className="
            flex
            flex-col
            sm:flex-row
            gap-4
            mt-8
            justify-center
            lg:justify-start
            "
          >
            <button
              className="
              bg-blue-700
              text-white
              px-6
              py-3
              rounded-xl
              font-medium
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
              font-medium
              hover:bg-blue-50
              transition
              "
            >
              Download Catalogue
            </button>
          </div>
        </motion.div>

        {/* RIGHT SECTION - VIDEO */}

        <motion.div
          initial={{
            opacity: 0,
            x: 80,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 1,
            delay: 0.3,
          }}
          className="
          relative
          h-[280px]
          sm:h-[350px]
          md:h-[420px]
          lg:h-[500px]
          flex
          items-center
          justify-center
          "
        >
          {/* Glow Effect */}

          <div
            className="
            absolute
            inset-0
            bg-blue-500/10
            blur-3xl
            rounded-full
            "
          />

          {/* Video */}

          <video
            autoPlay
            muted
            loop
            playsInline
            className="
            relative
            z-10
            w-full
            h-full
            rounded-3xl
            shadow-2xl
            border
            border-white/20
            object-cover
            "
          >
            <source
              src="/videos/packaging.mp4"
              type="video/mp4"
            />
          </video>
        </motion.div>
      </div>
    </section>
  );
}