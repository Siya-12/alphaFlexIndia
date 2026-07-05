"use client";

import { motion, type Variants } from "framer-motion";
import ProductCard from "./ProductCard";
import { products } from "@/data/products";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function ProductsSection() {
  return (
    <section
      id="products"
      className="
      py-20
      px-4
      bg-surface
      "
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center"
        >
          <h2
            className="
            text-4xl
            md:text-5xl
            font-bold
            text-ink
            "
          >
            Our Packaging Solutions
          </h2>

          <p
            className="
            mt-4
            text-ink/60
            max-w-2xl
            mx-auto
            "
          >
            High-quality packaging products
            designed for e-commerce,
            logistics, manufacturing and retail.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={container}
          className="
          mt-14
          grid
          grid-cols-2
          lg:grid-cols-4
          gap-5
          sm:gap-6
          lg:gap-8
          "
        >
          {products.map((product) => (
            <motion.div key={product.id} variants={item}>
              <ProductCard
                title={product.title}
                description={product.description}
                image={product.image}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}