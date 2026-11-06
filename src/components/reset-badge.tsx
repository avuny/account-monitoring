import { Badge } from "@/components/ui/badge";
import { formatDateTime, getResetStatus } from "@/lib/time";

const variants = { none: "outline", passed: "success", soon: "warning", upcoming: "secondary" } as const;

// passed = green, soon (< 24h) = amber, upcoming = neutral, none = outline
export function ResetBadge({ resetAt, now }: { resetAt: string | null; now: number }) {
  const s = getResetStatus(resetAt, now);
  return (
    <Badge variant={variants[s.kind]} title={resetAt ? formatDateTime(resetAt) : undefined}>
      {s.label}
    </Badge>
  );
}
