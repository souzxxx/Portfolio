"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import clsx from "clsx";

type Props = Omit<HTMLMotionProps<"div">, "children"> & {
  glow?: boolean;
  interactive?: boolean;
  children?: ReactNode;
};

export function GlassCard({
  className,
  glow = false,
  interactive = true,
  children,
  ...rest
}: Props) {
  return (
    <motion.div
      whileHover={interactive ? { y: -4 } : undefined}
      transition={{ type: "spring", stiffness: 240, damping: 20 }}
      className={clsx(
        "relative rounded-2xl border border-border/60 bg-surface/60 backdrop-blur-xl",
        "shadow-[0_0_0_1px_rgba(99,102,241,0.06)]",
        interactive &&
          "transition-colors hover:border-indigo-500/50 hover:bg-surface/80",
        className,
      )}
      {...rest}
    >
      {glow && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(600px circle at var(--mx,50%) var(--my,50%), rgba(99,102,241,0.12), transparent 40%)",
          }}
        />
      )}
      {children}
    </motion.div>
  );
}
