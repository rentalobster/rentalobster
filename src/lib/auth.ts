import jwt from "jsonwebtoken";
import nacl from "tweetnacl";
import bs58 from "bs58";

const JWT_SECRET = process.env.JWT_SECRET;
const SECRET = JWT_SECRET ?? "dev-secret-change-me";

export type JWTPayload = {
  userId: string;
  wallet: string;
};

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function generateNonce(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function verifyWalletSignature(
  message: string,
  signatureBase58: string,
  walletPublicKey: string
): boolean {
  try {
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = bs58.decode(signatureBase58);
    const publicKeyBytes = bs58.decode(walletPublicKey);
    return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
  } catch {
    return false;
  }
}

/** Validate a Solana wallet address (base58, 32 bytes) */
export function isValidSolanaAddress(address: string): boolean {
  if (typeof address !== "string") return false;
  if (address.length < 32 || address.length > 44) return false;
  try {
    const decoded = bs58.decode(address);
    return decoded.length === 32;
  } catch {
    return false;
  }
}

/** Read JWT from httpOnly cookie OR Authorization header (for programmatic API access) */
export function getAuthFromRequest(req: Request): JWTPayload | null {
  // 1. Authorization header (programmatic/external clients)
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return verifyToken(authHeader.slice(7));
  }

  // 2. httpOnly cookie (browser requests)
  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) {
    const token = parseCookie(cookieHeader, "ro_token");
    if (token) return verifyToken(token);
  }

  return null;
}

function parseCookie(cookieHeader: string, name: string): string | null {
  const entry = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return entry ? entry.slice(name.length + 1) : null;
}

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  path: "/",
};
