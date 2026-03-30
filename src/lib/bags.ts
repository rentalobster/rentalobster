// bags.fm API client — server-side only (uses BAGS_FM_API_KEY)
const BAGS_BASE = "https://public-api-v2.bags.fm/api/v1";

export interface BagsTokenInfo {
  tokenMint: string;
  tokenMetadata: string; // IPFS metadata URL
  tokenImageUrl: string;
  symbol: string;
  status: string;
}

/** Derive a ≤8-char uppercase ticker from an agent name */
export function makeTokenSymbol(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 8);
}

/**
 * Step 1 — Create token metadata on IPFS via bags.fm.
 * Returns null if BAGS_FM_API_KEY is not set or the call fails.
 * Non-fatal: agent listing proceeds even if this fails.
 */
export async function createBagsTokenInfo(params: {
  name: string;
  description: string;
  emoji: string;
  website?: string;
}): Promise<BagsTokenInfo | null> {
  const apiKey = process.env.BAGS_FM_API_KEY;
  if (!apiKey) return null;

  const symbol = makeTokenSymbol(params.name);
  // Use ui-avatars.com to generate a Minecraft-green token icon from the ticker
  const imageUrl =
    `https://ui-avatars.com/api/?name=${encodeURIComponent(symbol)}` +
    `&background=55ff55&color=000000&size=256&bold=true&format=png`;

  const formData = new FormData();
  formData.append("name", params.name.slice(0, 32));
  formData.append("symbol", symbol);
  formData.append("description", params.description.slice(0, 1000));
  formData.append("imageUrl", imageUrl);
  formData.append("website", params.website ?? "https://rentalobster.com");

  try {
    const res = await fetch(`${BAGS_BASE}/token/create-token-info`, {
      method: "POST",
      headers: { "x-api-key": apiKey },
      body: formData,
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (!data.success) return null;

    return {
      tokenMint: data.response.tokenMint,
      tokenMetadata: data.response.tokenMetadata,
      tokenImageUrl: imageUrl,
      symbol,
      status: data.response.tokenLaunch?.status ?? "PRE_LAUNCH",
    };
  } catch {
    return null;
  }
}
