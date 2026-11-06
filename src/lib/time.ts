export type ResetKind = "none" | "passed" | "soon" | "upcoming";

export function formatDuration(ms: number): string {
  const total = Math.floor(Math.abs(ms) / 1000);
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const parts: string[] = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  return parts.length ? parts.join(" ") : "less than a minute";
}

export function getResetStatus(resetAt: string | null, now: number): { kind: ResetKind; label: string } {
  if (!resetAt) return { kind: "none", label: "No reset set" };
  const diff = new Date(resetAt).getTime() - now;
  if (diff <= 0) return { kind: "passed", label: `Reset ${formatDuration(diff)} ago` };
  return { kind: diff < 24 * 3600 * 1000 ? "soon" : "upcoming", label: `Resets in ${formatDuration(diff)}` };
}

// Always rendered in the browser, so it uses the viewer's own time zone.
export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "medium" });
}

// Value format for <input type="datetime-local" step="1"> in local time.
export function toLocalInput(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
