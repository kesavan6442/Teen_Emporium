import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import heroSneaker from "@/assets/hero-sneaker.png";
import { useApp } from "@/context/AppContext";
import { Link } from "@tanstack/react-router";

export function Hero() {
  const { siteSettings } = useApp();
  return (
    <section className="relative min-h-[100svh] overflow-hidden pt-32 lg:pt-40">
      {/* ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--gradient-hero)" }}
      />
      {/* particles */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-white/40 animate-pulse-glow"
            style={{
              left: `${(i * 53) % 100}%`,
              top: `${(i * 37) % 100}%`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.05fr_1fr]">
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs text-muted-foreground"
          >
            <Sparkles className="h-3.5 w-3.5 text-[oklch(0.78_0.16_220)]" />
            New Season · Drop 04
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-6 font-display text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl"
          >
            STEP INTO <br />
            THE <span className="text-gradient">FUTURE</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg"
          >
            {siteSettings.promoBanner}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link to="/shop" className="group inline-flex items-center gap-2 rounded-2xl bg-[image:var(--gradient-primary)] px-6 py-3.5 text-sm font-semibold text-white glow-primary transition-transform hover:scale-[1.02]">
              Shop Now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/shop" className="inline-flex items-center gap-2 rounded-2xl glass px-6 py-3.5 text-sm font-semibold hover:bg-white/5">
              Explore Collection
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="mt-12 grid max-w-md grid-cols-3 gap-6"
          >
            {[
              [siteSettings.statBrands || "20+", "Premium Brands"],
              [siteSettings.statPairs || "10K+", "Authentic Pairs"],
              [siteSettings.statRating || "4.9★", "Customer Rating"],
            ].map(([n, l]) => (
              <div key={l}>
                <div className="font-display text-2xl font-bold">{n}</div>
                <div className="text-xs text-muted-foreground">{l}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* sneaker */}
        <div className="relative h-[420px] sm:h-[520px] lg:h-[640px]">
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
            style={{ background: "var(--gradient-primary)", opacity: 0.35 }}
          />
          <motion.img
            src={heroSneaker}
            alt="Featured premium sneaker"
            width={1280}
            height={1280}
            initial={{ opacity: 0, scale: 0.85, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: -4 }}
            transition={{ duration: 1, ease: [0.2, 0.7, 0.2, 1] }}
            className="relative z-10 mx-auto h-full w-full object-contain animate-float drop-shadow-[0_40px_60px_rgba(108,99,255,0.45)]"
          />
          {/* floating badges */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="absolute right-2 top-10 hidden sm:block glass-strong rounded-2xl p-3 text-xs"
          >
            <div className="text-muted-foreground">Limited Edition</div>
            <div className="font-display font-bold">Nebula X-01</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-12 left-2 hidden sm:block glass-strong rounded-2xl p-3 text-xs"
          >
            <div className="text-muted-foreground">From</div>
            <div className="font-display text-base font-bold">$249<span className="text-muted-foreground text-xs"> / pair</span></div>
          </motion.div>
        </div>
      </div>

      {/* brand marquee */}
      <div className="relative mt-16 border-y border-white/5 py-5">
        <div className="flex animate-marquee gap-14 whitespace-nowrap text-muted-foreground/70">
          {[...Array(2)].map((_, k) => (
            <div key={k} className="flex shrink-0 items-center gap-14 px-7">
              {["NIKE","ADIDAS","JORDAN","PUMA","NEW BALANCE","CONVERSE","ASICS","YEEZY","ON","SALOMON"].map(b => (
                <span key={b} className="font-display text-xl font-black tracking-[0.25em]">{b}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
