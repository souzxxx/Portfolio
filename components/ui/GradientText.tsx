import clsx from "clsx";
import type { ReactNode } from "react";

export function GradientText({
  children,
  className,
  as: Tag = "span",
}: {
  children: ReactNode;
  className?: string;
  as?: "span" | "h1" | "h2" | "h3" | "p" | "div";
}) {
  return (
    <Tag
      className={clsx(
        "bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-300",
        "bg-clip-text text-transparent",
        "bg-[length:200%_auto] animate-gradient-x",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
