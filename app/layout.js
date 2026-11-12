import { Inter, Syne, Poppins } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import ChatbotWidget from "@/components/chat/ChatbotWidget";
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

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata = {
  title: {
    default: "DesignTouch+ | Creative Studio",
    template: "%s | DesignTouch+",
  },
  description:
    "We create videos that grow brands. Video editing, motion graphics, social media content, and YouTube management for businesses and creators.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${syne.variable} ${poppins.variable}`}>
      <body className="font-sans bg-[#080808] text-white antialiased">
        <Navbar />
        {children}
        <Footer />
        <WhatsAppButton />
        <ChatbotWidget />
      </body>
    </html>
  );
}
