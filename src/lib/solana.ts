import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
} from "@solana/web3.js";

const NETWORK = (process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? "devnet") as
  | "devnet"
  | "mainnet-beta"
  | "testnet";

export const connection = new Connection(clusterApiUrl(NETWORK), "confirmed");

export const TREASURY_WALLET = process.env.NEXT_PUBLIC_TREASURY_WALLET ?? "";

export const PLATFORM_FEE_SOL = parseFloat(
  process.env.NEXT_PUBLIC_PLATFORM_FEE ?? "0.02"
);

export function solToLamports(sol: number): number {
  return Math.round(sol * LAMPORTS_PER_SOL);
}

export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

/** Verify that a transaction signature sent the expected amount to the treasury */
export async function verifyPaymentTx(
  txSignature: string,
  fromWallet: string,
  expectedLamports: number
): Promise<boolean> {
  try {
    const tx = await connection.getTransaction(txSignature, {
      maxSupportedTransactionVersion: 0,
    });
    if (!tx) return false;

    const meta = tx.meta;
    if (!meta || meta.err) return false;

    // Find treasury account index
    const accountKeys =
      tx.transaction.message.getAccountKeys?.().staticAccountKeys ??
      (tx.transaction.message as any).accountKeys;

    if (!accountKeys) return false;

    const treasuryIndex = accountKeys.findIndex(
      (k: PublicKey) => k.toBase58() === TREASURY_WALLET
    );
    if (treasuryIndex === -1) return false;

    // Check treasury received at least expectedLamports
    const preBal = meta.preBalances[treasuryIndex] ?? 0;
    const postBal = meta.postBalances[treasuryIndex] ?? 0;
    const received = postBal - preBal;

    return received >= expectedLamports;
  } catch {
    return false;
  }
}

export function formatSol(amount: number): string {
  return `${amount.toFixed(4)} SOL`;
}

export function getRentalTotal(pricePerHour: number, hours: number): number {
  return parseFloat((pricePerHour * hours + PLATFORM_FEE_SOL).toFixed(4));
}

/**
 * Verify that an escrow PDA was correctly funded by the renter.
 * Returns the escrow state if valid, null if invalid/not found.
 */
export async function verifyEscrowAccount(
  escrowPubkey: string,
  expectedRenterWallet: string,
  expectedTotalLamports: number,
): Promise<{ valid: boolean; agentOwner?: string; vaultBump?: number }> {
  try {
    const { fetchEscrowAccount } = await import("./escrow");
    const { PublicKey } = await import("@solana/web3.js");

    const escrow = await fetchEscrowAccount(connection, new PublicKey(escrowPubkey));
    if (!escrow) return { valid: false };
    if (escrow.status !== "Active") return { valid: false };
    if (escrow.renter !== expectedRenterWallet) return { valid: false };

    const totalLocked = Number(escrow.amountLamports + escrow.platformFeeLamports);
    if (totalLocked < expectedTotalLamports) return { valid: false };

    return { valid: true, agentOwner: escrow.agentOwner, vaultBump: escrow.vaultBump };
  } catch {
    return { valid: false };
  }
}
