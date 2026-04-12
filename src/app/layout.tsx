import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "../context/LanguageContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Setting up basic SEO metadata
export const metadata: Metadata = {
  title: "My Portfolio | Fullstack Developer",
  description: "Portfolio of a Junior Fullstack Developer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Here we apply the gradient background directly to the body tag.
        This avoids the CSS @apply error and keeps styles predictable.
      */}
      <body className="bg-gradient-to-br from-black via-zinc-800 to-zinc-900 min-h-screen text-white antialiased">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
