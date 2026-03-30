"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import WalletButton from "./WalletButton";

const navLinks = [
  { label: "Marketplace", href: "/marketplace" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Docs", href: "/docs" },
];
const CTALink = { label: "➕ List Agent", href: "/list-agent" };

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 xp-taskbar">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-0">
            <span className="xp-start flex items-center gap-2 no-underline">
              <Image
                src="/logo.png"
                alt="Rent a Lobster"
                width={28}
                height={28}
                style={{ imageRendering: "pixelated" }}
              />
              <span>Rent a Lobster</span>
            </span>
          </Link>

          {/* Desktop nav — XP taskbar buttons */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="xp-button text-[7px] px-3 py-1 no-underline"
              >
                {link.label}
              </a>
            ))}
            <a
              href={CTALink.href}
              className="xp-button xp-button-primary text-[7px] px-3 py-1 no-underline ml-1"
            >
              {CTALink.label}
            </a>
          </div>

          {/* System tray area */}
          <div className="hidden md:flex items-center gap-2 bg-[#1238a0] border border-[#0a2875] px-3 py-1"
               style={{ boxShadow: "inset 1px 1px #0a2875, inset -1px -1px #3a6ad4" }}>
            <WalletButton />
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden xp-button p-1"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden xp-window border-t-0">
          <div className="xp-titlebar">
            <span className="xp-titlebar-text flex items-center gap-1.5">
              <Image src="/logo.png" alt="Rent a Lobster" width={12} height={12} />
              Navigation
            </span>
            <button className="xp-close-btn" onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="p-2 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block xp-button text-[7px] w-full text-left"
                onClick={() => setOpen(false)}
              >
                ▶ {link.label}
              </a>
            ))}
            <a
              href={CTALink.href}
              className="block xp-button xp-button-primary text-[7px] w-full text-left"
              onClick={() => setOpen(false)}
            >
              {CTALink.label}
            </a>
            <div className="pt-2 border-t border-[#808080]">
              <WalletButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
