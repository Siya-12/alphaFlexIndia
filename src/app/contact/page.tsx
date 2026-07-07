"use client";

import { motion, type Variants } from "framer-motion";
import { MapPin, Phone, Mail } from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import { SiGmail } from "react-icons/si";
import Image from "next/image";


const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};
const contactCard = {
  title: "Contact Information",
  sections: [
    {
      icon: MapPin,
      heading: "Our Address",
      content: (
        <>
          <strong className="text-navy">Registered Office</strong>
          <br />
          H-1422, DSIDC Industrial Complex,
          <br />
          Narela Industrial Area,
          <br />
          Delhi – 110040, India
        </>
      ),
    },
    {
      icon: Phone,
      heading: "Phone Numbers",
      content: (
        <>
          <a
            href="tel:+919811655229"
            className="hover:text-indigo transition-colors"
          >
            <strong className="text-navy">+91 9811655229</strong> — Chirag Goyal
            (CEO)
          </a>
          <br />
          <a
            href="tel:+917289009229"
            className="hover:text-indigo transition-colors"
          >
            <strong className="text-navy">+91 7289009229</strong> — Vishard
            Bansal (Marketing)
          </a>
        </>
      ),
    },
    {
      icon: Mail,
      heading: "Email",
      content: (
        <>
          <a
            href="mailto:info@alphaflexindia.com"
            className="hover:text-indigo transition-colors"
          >
            info@alphaflexindia.com
          </a>
          <br />
          <a
            href="mailto:alphaflexindia@gmail.com"
            className="hover:text-indigo transition-colors"
          >
            alphaflexindia@gmail.com
          </a>
        </>
      ),
    },
  ],
};

const socialLinks = [
  {
    label: "WhatsApp",
    href: "https://wa.me/917289009229",
    bg: "bg-[#25D366] border-gray-200",
    icon: (
      <svg viewBox="0 0 32 32" width="22" height="22" fill="white">
        <path d="M16 0C7.164 0 0 7.163 0 16c0 2.82.737 5.46 2.024 7.754L0 32l8.418-2.01A15.93 15.93 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.27 13.27 0 01-6.76-1.843l-.484-.29-5.006 1.196 1.22-4.88-.317-.503A13.24 13.24 0 012.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.27-9.87c-.398-.199-2.355-1.161-2.72-1.294-.366-.132-.632-.199-.898.199-.266.398-1.03 1.294-1.263 1.56-.233.266-.465.298-.864.1-.398-.199-1.682-.62-3.204-1.979-1.184-1.057-1.984-2.363-2.217-2.761-.233-.398-.025-.613.175-.81.18-.178.398-.465.597-.698.199-.233.266-.398.398-.664.133-.266.066-.498-.033-.697-.1-.2-.898-2.165-1.23-2.963-.324-.778-.654-.673-.898-.686l-.764-.013c-.266 0-.698.1-1.063.498-.365.398-1.396 1.363-1.396 3.327s1.43 3.86 1.629 4.126c.199.266 2.814 4.297 6.82 6.027.954.412 1.699.659 2.279.843.958.305 1.83.262 2.52.159.768-.115 2.355-.963 2.688-1.894.333-.931.333-1.73.233-1.895-.1-.166-.366-.266-.764-.465z" />
      </svg>
    ),
  },
  {
  label: "Email",
  href: "https://mail.google.com/mail/?view=cm&fs=1&to=info@alphaflexindia.com",
  bg: "bg-white",
  icon: <SiGmail size={24} className="text-red-500" />,
},
  
{
  label: "LinkedIn",
  href: "https://www.linkedin.com/in/vishard-bansal-b09191248/",
  bg: "bg-[#0A66C2] border-gray-200",
  icon: <FaLinkedin size={20} color="white" />,
},
{
  label: "Location",
  href: "https://maps.google.com/?q=H-1422,+DSIDC+Industrial+Complex,+Narela,+Delhi",
  bg: "bg-white",
  icon: (
    <Image
      src="/logos/google-map-icon.webp"
      alt="Google Maps"
      width={24}
      height={24}
    />
  ),
},
];

export default function ContactPage() {
  return (
    <main className="bg-surface">

      {/* PAGE INTRO — no image */}
      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-3xl mx-auto px-6 pt-16 pb-4 lg:pt-20 text-center"
      >
        <motion.div
          variants={item}
          className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 text-sm font-medium text-ink/70 shadow-sm border border-ink/5 mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-indigo" />
          Get In Touch
        </motion.div>
        <motion.h1 variants={item} className="text-4xl md:text-5xl font-bold text-ink leading-tight">
          Contact <span className="italic font-serif text-indigo">Alpha Flex India</span>
        </motion.h1>
        <motion.p variants={item} className="mt-4 text-ink/60 leading-relaxed">
          We&apos;re here to help you find the perfect packaging solution. Reach out via call, email,
          WhatsApp, or visit us at our facility in Narela, Delhi.
        </motion.p>
      </motion.section>
{/* CONTACT INFO + MAP */}
<section className="max-w-7xl mx-auto px-6 py-14 lg:py-20">
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">

    {/* LEFT: Contact Information */}
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={container}
    >
  <motion.div
    variants={item}
    className="bg-white rounded-3xl border border-ink/5 shadow-sm hover:shadow-lg transition-all p-8"
  >
    <h3 className="text-2xl font-bold text-navy mb-8">
      {contactCard.title}
    </h3>

    <div className="space-y-8">
      {contactCard.sections.map((section, index) => {
        const Icon = section.icon;

        return (
          <div
            key={index}
            className="flex items-start gap-5"
          >
            <div className="w-12 h-12 shrink-0 rounded-xl bg-navy/5 border border-navy/10 flex items-center justify-center">
              <Icon size={20} className="text-navy" />
            </div>

            <div className="min-w-0">
              <h4 className="text-xs font-bold tracking-wider uppercase text-ink/40 mb-2">
                {section.heading}
              </h4>

              <div className="text-[15px] text-ink/70 leading-relaxed">
                {section.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </motion.div>
</motion.div>
          {/* RIGHT: map */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:sticky lg:top-28"
          >
            <div className="rounded-2xl overflow-hidden shadow-lg border border-ink/5">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3496.0986513946246!2d77.09240131508374!3d28.847297982354714!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d9b5f4c0f7b1d%3A0x6e2234fa8f9f5c1a!2sDSIDC%20Industrial%20Complex%2C%20Narela%2C%20Delhi%2C%20110040!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Alpha Flex India Location – DSIDC Narela Delhi"
                className="w-full h-[360px] sm:h-[420px] lg:h-[500px] border-0"
              />
            </div>
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href="https://maps.google.com/?q=H-1422,+DSIDC+Industrial+Complex,+Narela,+Delhi+110040"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-navy text-white text-sm font-semibold hover:bg-indigo transition-colors"
            >
              Open in Google Maps →
            </motion.a>
          </motion.div>

 </div>
</section>
      {/* CONNECT WITH US */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-3xl mx-auto px-6 pb-20 lg:pb-28 text-center"
      >
        <h3 className="text-xl font-semibold text-ink mb-6">Connect with us at:</h3>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          variants={container}
          className="flex items-center justify-center gap-4 flex-wrap"
        >
          {socialLinks.map((s) => (
            <motion.a
              key={s.label}
              variants={item}
              whileHover={{ scale: 1.15, rotate: -6 }}
              whileTap={{ scale: 0.9 }}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className={`w-14 h-14 rounded-full ${s.bg} flex items-center justify-center shadow-md`}
            >
              {s.icon}
            </motion.a>
          ))}
        </motion.div>
	
      </motion.section>
	  
    </main>
  );
}