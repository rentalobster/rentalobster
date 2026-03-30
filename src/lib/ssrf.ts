/**
 * SSRF protection — validates that a webhook URL is safe to fetch.
 * Blocks private IPs, localhost, and non-http(s) schemes.
 */

const PRIVATE_HOSTNAME_PATTERNS = [
  /^localhost$/i,
  /^127\.\d+\.\d+\.\d+$/,
  /^10\.\d+\.\d+\.\d+$/,
  /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/,
  /^192\.168\.\d+\.\d+$/,
  /^169\.254\.\d+\.\d+$/,   // link-local / AWS metadata
  /^0\.0\.0\.0$/,
  /^::1$/,
  /^fc[0-9a-f]{2}:/i,       // IPv6 unique local
  /^fe[89ab][0-9a-f]:/i,    // IPv6 link-local
  /^metadata\.google\.internal$/i,
];

export function isSafeWebhookUrl(rawUrl: string): boolean {
  if (!rawUrl || typeof rawUrl !== "string") return false;
  try {
    const url = new URL(rawUrl);
    if (!["http:", "https:"].includes(url.protocol)) return false;

    const hostname = url.hostname.toLowerCase();
    if (PRIVATE_HOSTNAME_PATTERNS.some((p) => p.test(hostname))) return false;

    // Block numeric IPv4 that resolves to private (basic check)
    const ipv4Parts = hostname.split(".");
    if (ipv4Parts.length === 4 && ipv4Parts.every((p) => /^\d+$/.test(p))) {
      const [a, b] = ipv4Parts.map(Number);
      if (a === 10 || a === 127 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 169 && b === 254)) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

export function sanitizeWebhookUrl(rawUrl: string): string | null {
  if (!isSafeWebhookUrl(rawUrl)) return null;
  return new URL(rawUrl).toString();
}
