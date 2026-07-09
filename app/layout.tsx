import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Antesa | Toko Online Premium",
  description: "Portofolio E-Commerce Fullstack",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-gray-50 text-gray-900">
        <Providers>
          <Navbar />
          <CartDrawer />
          <div className="flex-1">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
