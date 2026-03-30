"use client";

import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAuth } from "@/context/AuthContext";
import { Wallet, LogOut, Loader2, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

function shortWallet(addr: string) {
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

export default function WalletButton() {
  const { setVisible } = useWalletModal();
  const { connected, publicKey, disconnect } = useWallet();
  const { user, loading, signIn, signOut } = useAuth();
  const [dropOpen, setDropOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Not connected
  if (!connected) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="xp-button xp-button-primary flex items-center gap-1.5 text-[7px]"
      >
        <Wallet className="w-3 h-3" />
        Connect Wallet
      </button>
    );
  }

  // Connected but not authenticated
  if (!user) {
    return (
      <button
        onClick={signIn}
        disabled={loading}
        className="xp-button xp-button-primary flex items-center gap-1.5 text-[7px] disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Wallet className="w-3 h-3" />
        )}
        {loading ? "Signing..." : "Sign In"}
      </button>
    );
  }

  // Authenticated
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setDropOpen(!dropOpen)}
        className="xp-button flex items-center gap-1.5 text-[7px]"
      >
        <span className="text-sm">{user?.avatar_emoji ?? "🦞"}</span>
        <span>{shortWallet(publicKey!.toBase58())}</span>
        <ChevronDown className="w-3 h-3 text-[#555]" />
      </button>

      {dropOpen && (
        <div className="absolute right-0 top-full mt-0.5 w-52 xp-window z-50">
          <div className="xp-titlebar">
            <span className="xp-titlebar-text">👤 Account</span>
            <button className="xp-close-btn" onClick={() => setDropOpen(false)}>✕</button>
          </div>
          <div className="bg-[#ece9d8] p-1">
            <div className="xp-sunken bg-white px-3 py-2 mb-1">
              <div className="font-pixel text-[5px] text-[#555]">Connected as</div>
              <div className="font-retro text-[12px] text-[#000] truncate mt-0.5">
                {publicKey!.toBase58()}
              </div>
            </div>
            <a
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-1.5 xp-button w-full text-left text-[7px] mb-0.5 no-underline"
              onClick={() => setDropOpen(false)}
            >
              📊 Dashboard
            </a>
            <a
              href="/list-agent"
              className="flex items-center gap-2 px-3 py-1.5 xp-button w-full text-left text-[7px] mb-0.5 no-underline"
              onClick={() => setDropOpen(false)}
            >
              ➕ List Agent
            </a>
            <button
              onClick={() => {
                disconnect();
                signOut();
                setDropOpen(false);
              }}
              className="xp-button w-full flex items-center gap-2 px-3 py-1.5 text-[7px] text-red-700 border-t-2 border-[#808080] mt-1"
              style={{ borderBottom: "2px solid #fff" }}
            >
              <LogOut className="w-3 h-3" />
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
