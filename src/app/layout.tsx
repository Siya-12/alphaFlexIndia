import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsapp";




export const metadata: Metadata = {
  title: "Alpha Flex India",
  description: "India's most trusted packaging solution",
   icons: {
    icon: "/favicon.jpeg",
    shortcut: "/favicon.jpeg",
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