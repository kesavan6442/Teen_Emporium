import { ArrowRight } from "lucide-react";

export function Newsletter() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
      <div className="relative overflow-hidden rounded-3xl glass-strong p-8 sm:p-14">
        <div
          aria-hidden
          className="absolute -right-20 -top-20 h-72 w-72 rounded-full blur-3xl"
          style={{ background: "var(--gradient-primary)", opacity: 0.4 }}
        />
        <div
          aria-hidden
          className="absolute -left-16 bottom-0 h-60 w-60 rounded-full blur-3xl"
          style={{ background: "oklch(0.78 0.16 220)", opacity: 0.25 }}
        />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Inner Circle</div>
            <h3 className="mt-3 font-display text-3xl font-black sm:text-4xl">
              First in line for every <span className="text-gradient">drop.</span>
            </h3>
            <p className="mt-3 max-w-md text-muted-foreground">
              Join 80,000+ collectors. Early access, raffles, and the occasional secret release.
            </p>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex items-center gap-2 rounded-2xl glass p-2"
          >
            <input
              type="email"
              required
              placeholder="you@email.com"
              className="flex-1 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button className="inline-flex items-center gap-2 rounded-xl bg-[image:var(--gradient-primary)] px-4 py-2.5 text-xs font-semibold text-white glow-primary">
              Subscribe <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
