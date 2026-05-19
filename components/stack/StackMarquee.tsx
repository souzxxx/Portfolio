import { stack } from "@/lib/stack";
import { Reveal } from "../ui/Reveal";
import { SectionHeader } from "../ui/SectionHeader";

function Row({ items, reverse = false }: { items: typeof stack; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div className="relative overflow-hidden">
      <div
        className={`flex w-max gap-3 ${
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        }`}
      >
        {doubled.map((tech, i) => (
          <span
            key={`${tech.name}-${i}`}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-border/60 bg-surface/40 px-4 py-2 font-mono text-sm text-fg/80 backdrop-blur-xl"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: tech.color }}
            />
            {tech.name}
          </span>
        ))}
      </div>
    </div>
  );
}

export function StackMarquee() {
  const half = Math.ceil(stack.length / 2);
  const top = stack.slice(0, half);
  const bottom = stack.slice(half);

  return (
    <section id="stack" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <SectionHeader
          eyebrow="Stack"
          title="Tecnologias que uso"
          description="Frontend, backend, ML, infra — escolho a ferramenta certa para cada problema, não a moda."
        />
      </div>
      <Reveal className="mt-16 space-y-4">
        <div
          className="relative"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          }}
        >
          <Row items={top} />
        </div>
        <div
          className="relative"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          }}
        >
          <Row items={bottom} reverse />
        </div>
      </Reveal>
    </section>
  );
}
