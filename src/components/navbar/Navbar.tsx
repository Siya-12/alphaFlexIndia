import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-20 flex items-center justify-between">

          {/* Logo */}

          <Link href="/">
            <Image
              src="/logos/Alpha.png"
              alt="Alpha Flex"
              width={220}
              height={80}
              priority
            />
          </Link>

          {/* Navigation */}

          <nav className="hidden lg:flex items-center gap-8">

            <Link href="/">Home</Link>

            <Link href="/about">About</Link>

            <Link href="/products">Products</Link>

            <Link href="/industries">Industries</Link>

            <Link href="/gallery">Gallery</Link>

            <Link href="/blog">Blog</Link>

            <Link href="/contact">Contact</Link>

          </nav>

          {/* CTA Buttons */}

          <div className="hidden lg:flex gap-4">

            <a
              href="/catalogue/full-catalogue.pdf"
              download
              className="
              border
              border-blue-700
              px-5
              py-3
              rounded-lg
              text-blue-700
              font-medium
              "
            >
              Download Catalogue
            </a>

            <button
              className="
              bg-blue-700
              text-white
              px-5
              py-3
              rounded-lg
              "
            >
              Get Quote
            </button>

          </div>
        </div>
      </div>
    </header>
  );
}
