import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";

const MotionLink = motion(Link);

const brands = [
  { name: "Nike", items: "320 items" },
  { name: "Adidas", items: "284 items" },
  { name: "Jordan", items: "146 items" },
  { name: "Puma", items: "190 items" },
  { name: "New Balance", items: "112 items" },
  { name: "Converse", items: "78 items" },
];

export function Brands() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 sm:px-6 py-24">
      <SectionHeading
        eyebrow="Featured Brands"
        title="House of icons"
        sub="Six legendary labels. One curated destination."
      />

      <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">
        {brands.map((b, i) => (
          <MotionLink
            key={b.name}
            to="/shop"
            search={{ brand: b.name }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="group relative overflow-hidden rounded-2xl glass p-5 hover-lift"
          >
            <div
              aria-hidden
              className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{ background: "var(--gradient-primary)", filter: "blur(40px)", transform: "scale(0.6)" }}
            />
            <div className="relative">
              <div className="font-display text-xl font-black tracking-tight">{b.name}</div>
              <div className="mt-1 text-xs text-muted-foreground">{b.items}</div>
              <div className="mt-8 inline-flex text-[11px] uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground transition-colors">
                Explore →
              </div>
            </div>
          </MotionLink>
        ))}
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow, title, sub, align = "left",
}: { eyebrow: string; title: string; sub?: string; align?: "left" | "center" }) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
        <span className="h-px w-8 bg-[image:var(--gradient-primary)]" />
        {eyebrow}
      </div>
      <h2 className="mt-3 font-display text-4xl font-black tracking-tight sm:text-5xl">
        {title}
      </h2>
      {sub && <p className="mt-3 max-w-xl text-muted-foreground">{sub}</p>}
    </div>
  );
}
