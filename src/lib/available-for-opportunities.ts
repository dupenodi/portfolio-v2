/**
 * Hero + OG image: show “Available for opportunities” when truthy.
 * Set AVAILABLE_FOR_OPPORTUNITIES=false (or 0 / no) in env to hide for everyone.
 */
export function getAvailableForOpportunities(): boolean {
  const raw = process.env.AVAILABLE_FOR_OPPORTUNITIES;
  if (raw === undefined || raw === "") return true;
  const v = raw.trim().toLowerCase();
  return v !== "false" && v !== "0" && v !== "no";
}
