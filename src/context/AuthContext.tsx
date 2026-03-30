"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";

type AuthUser = {
  id: string;
  wallet: string;
  username: string | null;
  avatar_emoji: string;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  signIn: async () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { publicKey, signMessage, connected } = useWallet();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from httpOnly cookie on mount
  useEffect(() => {
    fetch("/api/user/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Auto sign-out when wallet disconnects
  useEffect(() => {
    if (!connected && user) {
      signOut();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  const signIn = useCallback(async () => {
    if (!publicKey || !signMessage) return;
    setLoading(true);
    try {
      const wallet = publicKey.toBase58();

      // 1. Get nonce
      const nonceRes = await fetch("/api/auth/nonce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet }),
      });
      const { message } = await nonceRes.json();

      // 2. Sign
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = await signMessage(messageBytes);
      const signature = bs58.encode(signatureBytes);

      // 3. Verify — server sets httpOnly cookie, returns { user }
      const verifyRes = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ wallet, signature, message }),
      });
      const { user: newUser } = await verifyRes.json();
      if (newUser) setUser(newUser);
    } finally {
      setLoading(false);
    }
  }, [publicKey, signMessage]);

  const signOut = useCallback(() => {
    setUser(null);
    fetch("/api/auth/signout", { method: "POST", credentials: "include" }).catch(() => {});
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
