export function StackChips({ stack }: { stack: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {stack.map((tech) => (
        <li
          key={tech}
          className="rounded-md border border-border bg-elevated/60 px-2 py-0.5 font-mono text-[11px] tracking-tight text-fg/80"
        >
          {tech}
        </li>
      ))}
    </ul>
  );
}
