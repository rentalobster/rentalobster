/** Generates a rental code in RC-[12 hex chars] format — matches rentaclaw convention */
export function generateSessionKey(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `RO-${hex}`; // RO = RentalObster
}

/** Masks a rental code for display */
export function maskSessionKey(key: string): string {
  if (key.length <= 10) return key;
  return `${key.slice(0, 8)}...`;
}
