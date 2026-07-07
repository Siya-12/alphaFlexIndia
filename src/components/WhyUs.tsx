"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const item: Variants = {
  hidden: { opacity: 0, x: -30 },
  show: { opacity: 1, x: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const reasons = [
  {
    number: "01",
    title: "14+ Years of Trusted Expertise",
    description: "Since 2012, we've packaged for India's biggest brands — reliably, every single time.",
  },
  {
    number: "02",
    title: "Custom Printing, Built for Brands",
    description: "3-colour custom printing that turns your packaging into a marketing asset, not an afterthought.",
  },
  {
    number: "03",
    title: "Bulk Without Compromise",
    description: "From 1,000 units to millions — consistent quality at any order size.",
  },
  {
    number: "04",
    title: "Advanced In-House Manufacturing",
    description: "3-layer co-extrusion, lamination, sealing, and QC — all under one roof.",
  },
  {
    number: "05",
    title: "PAN India, On Time",
    description: "Dependable delivery to every major industrial region in the country.",
  },
];

export default function WhyUs() {
  return (
    <section id="why" className="bg-navy py-20 lg:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center">
        {/* LEFT: heading + white feature cards */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={container}
        >

     <motion.div variants={item} className="mb-10"> 
        <div className="relative mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full border border-[#4C5FE0]/40 bg-[#4C5FE0]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#9AA6F5]">
            About Us
          </span>
          <h2 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Why <em className="not-italic text-[#4C5FE0]">Choose</em>{" "}
            Us
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#B7C0CC] sm:text-lg">
           Most Trusted Flexible Packaging Partner
          </p>
        </div>
        </div>
        </motion.div>
         

          <div className="flex flex-col gap-4">
            {reasons.map((r) => (
              <motion.div
                key={r.number}
                variants={item}
                whileHover={{ x: 6 }}
                className="flex gap-4 bg-white rounded-2xl p-5 shadow-lg"
              >
                <div className="shrink-0 w-11 h-11 rounded-xl bg-navy/5 border border-navy/10 flex items-center justify-center font-serif italic font-bold text-indigo">
                  {r.number}
                </div>
                <div>
                  <h4 className="font-bold text-ink mb-1">{r.title}</h4>
                  <p className="text-sm text-ink/60 leading-relaxed">{r.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT: office image — leave space, placeholder for now */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative hidden lg:block"
        >
          <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5]">
            <Image
              src="/images/office.jpeg"
              alt="Alpha Flex India office"
              fill
              sizes="(max-width: 1024px) 0px, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/40 via-transparent to-transparent" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="absolute -bottom-6 -left-6 bg-white rounded-2xl px-6 py-4 shadow-xl"
          >
            <p className="text-ink/70 italic text-sm leading-relaxed max-w-[220px]">
              &ldquo;Packaging is more than a protective layer — it&apos;s a reflection of a brand&apos;s
              commitment to quality.&rdquo;
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}