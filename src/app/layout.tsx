import type { Metadata } from "next";
import { Press_Start_2P, VT323, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SolanaWalletProvider } from "@/context/WalletProvider";
import Navbar from "@/components/Navbar";

const pressStart2P = Press_Start_2P({
  variable: "--font-geist-sans",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const vt323 = VT323({
  variable: "--font-vt323",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rent a Lobster — AI Agent Rental Marketplace",
  description:
    "The decentralized marketplace for AI agent rentals. Browse, rent, and deploy powerful AI agents instantly — powered by Solana smart contracts.",
  keywords: ["AI agents", "rental", "Solana", "decentralized", "marketplace", "rent a lobster"],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Rent a Lobster — AI Agent Rental Marketplace",
    description: "Pay-per-use AI agent rentals. No subscriptions. Escrow-protected. Powered by Solana.",
    images: [{ url: "/logo.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rent a Lobster",
    description: "Pay-per-use AI agent rentals. No subscriptions. Escrow-protected.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${pressStart2P.variable} ${vt323.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col text-white">
        <SolanaWalletProvider>
          <Navbar />
          {children}
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
