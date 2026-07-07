import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsapp";



export const metadata: Metadata = {
  title: {
    default: "Alpha Flex India",
    template: "%s | Alpha Flex India",
  },

  description:
    "Alpha Flex India is a leading manufacturer of high-quality flexible packaging solutions for food, pharmaceuticals, FMCG, and industrial applications.",

  keywords: [
    "Flexible Packaging",
    "Packaging Manufacturer",
    "Alpha Flex India",
    "Industrial Packaging",
    "Food Packaging",
    "Pharma Packaging",
    "Plastic Packaging",
    "Delhi Packaging Company",
    "Tamper Proof Courier Bags",
    "LDPE Shrink Films",
    "LDPE Lamination Films",
    "LDPE Pouches",

  ],

  authors: [{ name: "Alpha Flex India" }],

  creator: "Alpha Flex India",

  publisher: "Alpha Flex India",

  metadataBase: new URL("https://alphaflexindia.com"),

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    title: "Alpha Flex India",
    description:
      "High-quality flexible packaging solutions tailored for modern industries.",

    url: "https://alphaflexindia.com",

    siteName: "Alpha Flex India",

    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
      },
    ],

    locale: "en_IN",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Alpha Flex India",
    description:
      "Leading manufacturer of flexible packaging products.",

    images: ["/images/og-image.png"],
  },

  icons: {
    icon: "/favicon.jpeg",
    apple: "/favicon.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en">
      <body>
            <Navbar />
           {children}
             <FloatingWhatsApp />
            <Footer />      
      </body>
     </html>
   );
 }