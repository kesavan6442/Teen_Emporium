import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "./Brands";
import { Link } from "@tanstack/react-router";
import running from "@/assets/collection-running.jpg";
import street from "@/assets/collection-street.jpg";
import basket from "@/assets/collection-basketball.jpg";

const items = [
  { title: "Nike Collection", desc: "Just do it.", img: running, span: "lg:col-span-2 lg:row-span-2", search: { brand: "Nike" } },
  { title: "Adidas Originals", desc: "Classic lifestyle.", img: street, span: "", search: { brand: "Adidas" } },
  { title: "Jordan Exclusives", desc: "Flight club.", img: basket, span: "", search: { brand: "Jordan" } },
  { title: "Puma Streetwear", desc: "Forever faster.", img: street, span: "lg:col-span-2", search: { brand: "Puma" } },
  { title: "New Balance", desc: "Timeless comfort.", img: running, span: "", search: { brand: "New Balance" } },
];

export function Trending() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 sm:px-6 py-24">
      <SectionHeading
        eyebrow="Trending Collections"
        title="Editorial drops"
        sub="Five worlds. One wardrobe."
      />

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[280px]">
        {items.map((it, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: i * 0.06 }}
            className={`group relative overflow-hidden rounded-2xl glass ${it.span}`}
          >
            <Link to="/shop" search={it.search} className="absolute inset-0 block h-full w-full text-left">
              <img
                src={it.img}
                alt={it.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-80 transition-all duration-700 group-hover:scale-110 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <div className="relative flex h-full min-h-[260px] flex-col justify-end p-6">
                <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Collection</div>
                <div className="mt-1 flex items-end justify-between gap-3">
                  <h3 className="font-display text-2xl font-black sm:text-3xl text-white">{it.title}</h3>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full glass-strong transition-transform group-hover:-rotate-45 text-white">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{it.desc}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
