"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, type Variants, AnimatePresence } from "framer-motion";
import { MapPin, Phone, Mail, ChevronDown } from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import { SiGmail } from "react-icons/si";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const quickLinks = [
  { label: "Home", href: "/#home" },
  { label: "Products", href: "/#products" },
  { label: "Machines", href: "/#machines" },
  { label: "Why Choose Us", href: "/#why" },
  { label: "Manufacturing Process", href: "/#process" },
  { label: "Our Clients", href: "/#clients" },
  { label: "Contact Us", href: "/contact" },
];

const productLinks = [
  { label: "LDPE Shrink Film", href: "/#products" },
  { label: "LDPE Lamination Film", href: "/#products" },
  { label: "Tamper Proof Courier Bags", href: "/#products" },
  { label: "LDPE Pouches", href: "/#products" },
  { label: "Custom Printed Packaging", href: "/#products" },
  { label: "Request Catalogue", href: "/catalogue/catalogue.pdf" },
];

const contactItems = [
  {
    icon: MapPin,
    text: "H-1422, DSIDC Industrial Complex, Narela Industrial Area, Delhi – 110040",
  },
  {
    icon: Phone,
    text: (
      <>
        +91 9811655229 (Chirag Goyal, CEO)
        <br />
        +91 7289009229 (Vishard Bansal, Marketing)
      </>
    ),
  },
  {
    icon: Mail,
    text: (
      <>
        info@alphaflexindia.com
        <br />
        alphaflexindia@gmail.com
      </>
    ),
  },
];

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
    href: "mailto:info@alphaflexindia.com",
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

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 32 32" width="18" height="18" fill="currentColor">
      <path d="M16 0C7.164 0 0 7.163 0 16c0 2.82.737 5.46 2.024 7.754L0 32l8.418-2.01A15.93 15.93 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.27 13.27 0 01-6.76-1.843l-.484-.29-5.006 1.196 1.22-4.88-.317-.503A13.24 13.24 0 012.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.27-9.87c-.398-.199-2.355-1.161-2.72-1.294-.366-.132-.632-.199-.898.199-.266.398-1.03 1.294-1.263 1.56-.233.266-.465.298-.864.1-.398-.199-1.682-.62-3.204-1.979-1.184-1.057-1.984-2.363-2.217-2.761-.233-.398-.025-.613.175-.81.18-.178.398-.465.597-.698.199-.233.266-.398.398-.664.133-.266.066-.498-.033-.697-.1-.2-.898-2.165-1.23-2.963-.324-.778-.654-.673-.898-.686l-.764-.013c-.266 0-.698.1-1.063.498-.365.398-1.396 1.363-1.396 3.327s1.43 3.86 1.629 4.126c.199.266 2.814 4.297 6.82 6.027.954.412 1.699.659 2.279.843.958.305 1.83.262 2.52.159.768-.115 2.355-.963 2.688-1.894.333-.931.333-1.73.233-1.895-.1-.166-.366-.266-.764-.465z" />
    </svg>
  );
}

function FooterLinkList({ links }: { links: { label: string; href: string }[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {links.map((l) => (
        <li key={l.label}>
          <Link href={l.href} className="text-white/60 hover:text-indigo-light text-sm transition-colors">
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function FooterContactList() {
  return (
    <ul className="flex flex-col gap-4">
      {contactItems.map(({ icon: Icon, text }, i) => (
        <li key={i} className="flex gap-3 text-sm text-white/60 leading-relaxed">
          <Icon size={18} className="text-indigo-light shrink-0 mt-0.5" />
          <span>{text}</span>
        </li>
      ))}
    </ul>
  );
}

// ── Mobile accordion section ──────────────────────────
function AccordionSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/10 py-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="text-xs font-bold tracking-wider uppercase text-white/40">{title}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown size={16} className="text-white/40" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
// ───────────────────────────────────────────────────────
export default function Footer() {
  return (
    <footer className="text-white bg-[url('/images/footer_bg.jpg')] bg-cover bg-center bg-no-repeat">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        variants={container}
        className="max-w-7xl mx-auto px-6 pt-10 pb-6"
      >
        {/* BRAND — logo + social icons, stacked on mobile, row on desktop */}
        <motion.div
          variants={item}
          className="flex flex-col items-center gap-5 md:flex-row md:items-center md:justify-between mb-8"
        >
          <div className="inline-flex bg-gray-200 rounded-lg p-2 shrink-0">
            <Link href="/#home" className="flex items-center">
              <Image
                src="/images/Alpha.png"
                alt="Alpha Flex India"
                width={140}
                height={40}
                priority
              />
            </Link>
          </div>

          <div className="flex items-center gap-4 sm:gap-5 md:gap-6">
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
                className={`w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full ${s.bg} flex items-center justify-center shadow-md shrink-0`}
              >
                {s.icon}
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* DESKTOP: 3-column grid | MOBILE: accordion */}
        <motion.div variants={item} className="hidden md:grid grid-cols-3 gap-10">
          <div>
            <div className="text-xs font-bold tracking-wider uppercase text-white/40 mb-4">Quick Links</div>
            <FooterLinkList links={quickLinks} />
          </div>
          <div>
            <div className="text-xs font-bold tracking-wider uppercase text-white/40 mb-4">Products</div>
            <FooterLinkList links={productLinks} />
          </div>
          <div>
            <div className="text-xs font-bold tracking-wider uppercase text-white/40 mb-4">Contact Us</div>
            <FooterContactList />
          </div>
        </motion.div>

        <motion.div variants={item} className="md:hidden -mt-2">
          <AccordionSection title="Quick Links">
            <FooterLinkList links={quickLinks} />
          </AccordionSection>
          <AccordionSection title="Products">
            <FooterLinkList links={productLinks} />
          </AccordionSection>
          <AccordionSection title="Contact Us">
            <FooterContactList />
          </AccordionSection>
        </motion.div>

        {/* BOTTOM BAR */}
        <motion.div
          variants={item}
          className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/40"
        >
          <span>© 2026 Alpha Flex India. All Rights Reserved</span>
          <span>Made with ❤️ by Siya Agarwal</span>
        </motion.div>
      </motion.div>
    </footer>
  );
}