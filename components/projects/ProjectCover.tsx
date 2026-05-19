import clsx from "clsx";

const palettes = [
  ["#6366f1", "#a855f7"],
  ["#22d3ee", "#6366f1"],
  ["#a855f7", "#ec4899"],
  ["#f59e0b", "#ef4444"],
  ["#22c55e", "#06b6d4"],
  ["#8b5cf6", "#3b82f6"],
  ["#0ea5e9", "#8b5cf6"],
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function ProjectCover({
  slug,
  name,
  language,
  className,
}: {
  slug: string;
  name: string;
  language?: string;
  className?: string;
}) {
  const [a, b] = palettes[hash(slug) % palettes.length];
  const initials = name
    .split(/[\s\-—]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <div
      className={clsx(
        "relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-xl",
        className,
      )}
      style={{
        background: `radial-gradient(circle at 30% 20%, ${a}55, transparent 60%), radial-gradient(circle at 70% 80%, ${b}55, transparent 60%), linear-gradient(135deg, #0f0f1a 0%, #16162a 100%)`,
      }}
    >
      {/* grid overlay */}
      <svg
        aria-hidden
        className="absolute inset-0 h-full w-full opacity-30"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id={`grid-${slug}`} width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${slug})`} />
      </svg>

      {/* center initials */}
      <div className="relative flex flex-col items-center gap-3 text-center">
        <span
          className="font-mono text-7xl font-bold tracking-tighter"
          style={{
            background: `linear-gradient(135deg, ${a}, ${b})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {initials}
        </span>
        {language && (
          <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 font-mono text-xs uppercase tracking-widest text-white/70 backdrop-blur">
            {language}
          </span>
        )}
      </div>

      {/* corner brackets */}
      <div className="pointer-events-none absolute left-3 top-3 h-5 w-5 border-l border-t border-white/30" />
      <div className="pointer-events-none absolute right-3 top-3 h-5 w-5 border-r border-t border-white/30" />
      <div className="pointer-events-none absolute bottom-3 left-3 h-5 w-5 border-b border-l border-white/30" />
      <div className="pointer-events-none absolute bottom-3 right-3 h-5 w-5 border-b border-r border-white/30" />
    </div>
  );
}
