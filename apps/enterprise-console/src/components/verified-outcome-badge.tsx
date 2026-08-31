"use client";

export type VerificationStatus =
  "predicted" | "evaluated" | "verified" | "pending" | "chain-verified" | "n/a";

export function VerifiedOutcomeBadge({
  status,
  accuracyPct,
  predicted,
  actual,
}: {
  status: string;
  accuracyPct?: number | null;
  predicted?: unknown;
  actual?: unknown;
}) {
  const s = (status || "pending").toLowerCase();
  const tone: Record<string, string> = {
    verified: "bg-success/10 text-success border-success/20",
    evaluated: "bg-warning/10 text-warning border-warning/20",
    predicted: "bg-surface text-text-muted border-border",
    pending: "bg-surface text-text-muted border-border",
    "chain-verified": "bg-primary/10 text-primary border-primary/20",
  };
  const cls = tone[s] ?? tone.pending ?? "";
  const predictedStr =
    predicted != null
      ? typeof predicted === "object"
        ? JSON.stringify(predicted)
        : (predicted as string)
      : "";
  const actualStr = typeof actual === "object" ? JSON.stringify(actual) : (actual as string);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${cls}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden />
      {s === "verified"
        ? "VERIFIED"
        : s === "evaluated"
          ? "VERIFYING"
          : s === "predicted"
            ? "PREDICTED"
            : s.toUpperCase()}
      {accuracyPct != null ? <span>· {accuracyPct}% accuracy</span> : null}
      {actual != null ? (
        <span className="text-[10px] opacity-70">
          pred {predictedStr} → actual {actualStr}
        </span>
      ) : null}
    </span>
  );
}

const LIFECYCLE: Record<string, string[]> = {
  EXECUTED: ["EXECUTED"],
  VERIFYING: ["EXECUTED", "VERIFYING"],
  VERIFIED: ["EXECUTED", "VERIFYING", "VERIFIED"],
  evaluated: ["EXECUTED", "VERIFYING"],
  verified: ["EXECUTED", "VERIFYING", "VERIFIED"],
};

export function LifecycleBar({ status }: { status: string }) {
  const steps = LIFECYCLE[status] ?? LIFECYCLE[status.toLowerCase()] ?? ["EXECUTED"];
  const all = ["EXECUTED", "VERIFYING", "VERIFIED"];
  return (
    <div className="flex items-center gap-1.5">
      {all.map((label) => {
        const active = steps.includes(label);
        return (
          <span
            key={label}
            className={`rounded-full border px-2 py-0.5 text-[10px] ${active ? "bg-primary text-primary-foreground border-primary" : "bg-surface text-text-muted border-border"}`}
          >
            {label}
          </span>
        );
      })}
    </div>
  );
}
