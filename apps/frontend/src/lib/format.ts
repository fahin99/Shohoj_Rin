/** Bangladeshi taka formatting, shared by every financial surface. */
export function formatTaka(amount: number, opts: { decimals?: boolean } = {}) {
  const value = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: opts.decimals ? 2 : 0,
    maximumFractionDigits: opts.decimals ? 2 : 0,
  }).format(amount);
  return `৳${value}`;
}

export function formatPercent(rate: number) {
  return `${rate}% p.a.`;
}

export function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
