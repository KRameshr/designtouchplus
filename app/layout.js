import { Inter, Syne } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getCompanyInfo } from "@/lib/api";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

export const metadata = {
  title: "DesignTouch+ | Creative Video Editing & Motion Graphics Agency",
  description:
    "We create videos that grow brands. Video editing, motion graphics, social media content, and YouTube management for businesses and creators.",
};

export default async function RootLayout({ children }) {
  // Fetched once here (server-side) and passed down to Footer, since it
  // appears on every page — avoids every page re-fetching the same data.
  const companyInfo = await getCompanyInfo().catch(() => null);

  return (
    <html lang="en" className={`${inter.variable} ${syne.variable}`}>
      <body className="font-sans bg-[#080808] text-white antialiased">
        <Navbar />
        {children}
        <Footer companyInfo={companyInfo} />
      </body>
    </html>
  );
}
