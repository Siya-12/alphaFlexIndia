import Image from "next/image";
import Link from "next/link";
import HeroBackground from "@/components/hero/HeroBackground";

 import {
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer
      className="
      text-black relative
      min-h-[85vh]
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
        
        "
      >
        <div
          className="
          grid
          grid-cols-1
          md:grid-cols-2
          lg:grid-cols-4
          gap-12
          "
        >
          {/* Company */}

          <div>
            <Image
              src="/logos/Alpha.png"
              alt="Alpha Flex India"
              width={220}
              height={80}
              className="bg-white rounded-lg p-2"
            />

            <p
              className="
              mt-6
              text-black/80
              leading-8
              "
            >
              Alpha Flex India delivers
              innovative packaging solutions
              including courier bags,
              labels, shrink films and
              industrial packaging products.
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3">
                <Phone size={18} />
                <span>+91 7289009229</span>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={18} />
                <span>info@alphaflexindia.com</span>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <FaFacebookF size={20} />
              <FaInstagram size={20} />
              <FaLinkedinIn size={20} />
            </div>
          </div>

          {/* Products */}

          <div>
            <h3
              className="
              text-2xl
              font-semibold
              mb-6
              "
            >
              Our Products
            </h3>

            <div className="space-y-3">
              <Link href="/products">
                Poly Courier Bags
              </Link>

              <br />

              <Link href="/products">
                Paper Courier Bags
              </Link>

              <br />

              <Link href="/products">
                Direct Thermal Labels
              </Link>

              <br />

              <Link href="/products">
                Chromo Labels
              </Link>

              <br />

              <Link href="/products">
                LDPE Pouches
              </Link>

              <br />

              <Link href="/products">
                Shrink Films
              </Link>
            </div>
          </div>

          {/* Quick Links */}

          <div>
            <h3
              className="
              text-2xl
              font-semibold
              mb-6
              "
            >
              Quick Links
            </h3>

            <div className="space-y-3">
              <Link href="/">Home</Link>

              <br />

              <Link href="/about">About</Link>

              <br />

              <Link href="/products">
                Products
              </Link>

              <br />

              <Link href="/gallery">
                Gallery
              </Link>

              <br />

              <Link href="/contact">
                Contact
              </Link>
            </div>
          </div>

          {/* Contact */}

          <div>
            <h3
              className="
              text-2xl
              font-semibold
              mb-6
              "
            >
              Contact Us
            </h3>

            <div className="space-y-5">
              <div className="flex gap-3">
                <MapPin />

                <p>
                   H-1421, 59 DSIDC,  
                  <br />
                  NARELA INDUSTRIAL AREA,
                  <br />
                  Delhi-110040, India
                </p>
              </div>

              <div className="flex gap-3">
                <Phone />
                <p>+91 7289009229</p>
                 
              </div>

              <div className="flex gap-3">
                <Mail />
                <p>
                  info@alphaflexindia.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}

      <div
        className="
        border-t
        border-white/20
        py-5
        text-center
        text-black/80
        "
      >
        <br /><br />
        © 2012 Alpha Flex India.
        All Rights Reserved.
      </div>
    </footer>
  );
}