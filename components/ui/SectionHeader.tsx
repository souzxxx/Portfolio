import { Reveal } from "./Reveal";
import clsx from "clsx";

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <Reveal>
      <div
        className={clsx(
          "max-w-3xl",
          align === "center" && "mx-auto text-center",
        )}
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-mono uppercase tracking-widest text-indigo-300">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
          {eyebrow}
        </span>
        <h2 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-fg sm:text-5xl md:text-6xl">
          {title}
        </h2>
        {description && (
          <p className="mt-5 text-balance text-lg leading-relaxed text-muted">
            {description}
          </p>
        )}
      </div>
    </Reveal>
  );
}
