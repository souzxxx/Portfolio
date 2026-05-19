"use client";

import { animate, useInView, useMotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export function StatsCounter({
  value,
  label,
  suffix = "",
}: {
  value: number;
  label: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const motion = useMotionValue(0);
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const controls = animate(motion, value, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(String(Math.round(v))),
    });
    return controls.stop;
  }, [inView, motion, value]);

  return (
    <div ref={ref} className="flex flex-col">
      <div className="font-mono text-3xl font-semibold tabular-nums text-fg sm:text-4xl md:text-5xl">
        {display}
        <span className="text-indigo-400">{suffix}</span>
      </div>
      <div className="mt-2 font-mono text-xs uppercase tracking-widest text-muted">
        {label}
      </div>
    </div>
  );
}
