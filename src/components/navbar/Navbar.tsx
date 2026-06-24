"use client";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";


export default function Navbar() {
  const { data: session } = useSession();
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

            {session ? (
              <div className="flex gap-3">
                <Link
                  href="/profile"
                  className="border px-4 py-2 rounded"
                >
                  {session.user?.name}
                </Link>

                <button
                  onClick={() => signOut()}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="border px-4 py-2 rounded"
              >
                Login
              </Link>
            )}

            <button
              className="
              bg-blue-700
              text-white
              px-5
              py-3
              rounded-lg
              hover:bg-blue-800
              transition
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
