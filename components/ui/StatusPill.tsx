import clsx from "clsx";

const map = {
  deployed: { label: "Live", dot: "bg-emerald-400", text: "text-emerald-300", border: "border-emerald-500/30", bg: "bg-emerald-500/10" },
  shipped: { label: "Shipped", dot: "bg-cyan-400", text: "text-cyan-300", border: "border-cyan-500/30", bg: "bg-cyan-500/10" },
  wip: { label: "WIP", dot: "bg-amber-400", text: "text-amber-300", border: "border-amber-500/30", bg: "bg-amber-500/10" },
} as const;

export function StatusPill({ status, isPrivate }: { status: keyof typeof map; isPrivate?: boolean }) {
  const cfg = map[status];
  return (
    <div className="flex items-center gap-2">
      <span
        className={clsx(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
          cfg.border,
          cfg.bg,
          cfg.text,
        )}
      >
        <span className={clsx("h-1.5 w-1.5 rounded-full animate-pulse", cfg.dot)} />
        {cfg.label}
      </span>
      {isPrivate && (
        <span className="inline-flex items-center rounded-full border border-zinc-700/60 bg-zinc-900/60 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
          Private
        </span>
      )}
    </div>
  );
}
