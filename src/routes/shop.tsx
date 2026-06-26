import { useState, useMemo, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { ProductCard } from "@/components/site/ProductCard";
import { useApp } from "@/context/AppContext";
import { SlidersHorizontal, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type ShopSearch = {
  brand?: string;
  search?: string;
  badge?: string;
};

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => {
    return {
      brand: typeof search.brand === "string" ? search.brand : undefined,
      search: typeof search.search === "string" ? search.search : undefined,
      badge: typeof search.badge === "string" ? search.badge : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Shop — Teens Emporium" },
      { name: "description", content: "Browse premium sneakers from leading global brands." },
    ],
  }),
  component: Shop,
});

const filtersList = [
  { label: "Brand", options: ["Nike", "Adidas", "Jordan", "Puma", "New Balance", "Converse"] }
];

function Shop() {
  const { brand, search: searchParam, badge } = Route.useSearch();
  const { products, loading } = useApp();

  // Filters State
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("Newest");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Sync search parameters to local filter state on load or change
  useEffect(() => {
    if (brand) {
      setSelectedBrands([brand]);
    } else {
      setSelectedBrands([]);
    }
    if (searchParam) {
      setSearchQuery(searchParam);
    } else {
      setSearchQuery("");
    }
  }, [brand, searchParam]);

  const handleBrandChange = (brandName: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brandName) ? prev.filter((b) => b !== brandName) : [...prev, brandName]
    );
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
      );
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      result = result.filter((p) => selectedBrands.includes(p.brand));
    }

    // Badge filter
    if (badge) {
      result = result.filter((p) => p.badge?.toLowerCase() === badge.toLowerCase());
    }

    // Sorting
    if (sortBy === "Price: Low to High") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "Price: High to Low") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "Popular") {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      // "Newest" - sort by ID or default order
      result.sort((a, b) => b.id.localeCompare(a.id));
    }

    return result;
  }, [products, selectedBrands, sortBy, searchQuery, badge]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <Navbar />
      <main className="flex-grow mx-auto w-full max-w-7xl px-4 sm:px-6 pt-32 lg:pt-40 pb-24">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              All Products
            </div>
            <h1 className="mt-2 font-display text-4xl font-black sm:text-5xl">Shop the collection</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search sneakers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl glass pl-9 pr-4 py-2 text-sm outline-none w-48 sm:w-60 focus:border-white/20 transition-all"
              />
            </div>

            {/* Mobile Filters Trigger */}
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className="lg:hidden flex items-center gap-2 rounded-xl glass px-4 py-2 text-sm font-semibold hover:bg-white/5 transition-colors cursor-pointer border border-white/5 text-white"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl glass px-3 py-2 text-sm outline-none cursor-pointer border border-white/5"
            >
              <option value="Newest">Newest</option>
              <option value="Popular">Popular</option>
              <option value="Price: Low to High">Price: Low to High</option>
              <option value="Price: High to Low">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Desktop Sidebar (hidden on mobile/tablet) */}
          <aside className="hidden lg:block lg:space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </div>

            {/* Brands Filter */}
            <div className="rounded-2xl glass p-4 border border-white/5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Brands
              </div>
              <div className="mt-3 space-y-2">
                {filtersList[0].options.map((o) => (
                  <label
                    key={o}
                    className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground/80 hover:text-foreground"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(o)}
                      onChange={() => handleBrandChange(o)}
                      className="h-4 w-4 rounded border-white/20 bg-white/5 accent-[oklch(0.62_0.21_285)] cursor-pointer"
                    />
                    {o}
                  </label>
                ))}
              </div>
            </div>

            {/* Rest of the static options for decoration */}
            {filtersList.slice(1).map((f) => (
              <div key={f.label} className="rounded-2xl glass p-4 border border-white/5 opacity-60">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {f.label}
                </div>
                <div className="mt-3 space-y-2">
                  {f.options.map((o) => (
                    <label
                      key={o}
                      className="flex cursor-not-allowed items-center gap-2.5 text-sm text-foreground/50"
                    >
                      <input
                        type="checkbox"
                        disabled
                        className="h-4 w-4 rounded border-white/10 bg-white/5"
                      />
                      {o}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </aside>

          <div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-white/5 rounded-2xl aspect-[3/4]" />
                ))
              ) : (
                filteredProducts.map((p, i) => (
                  <ProductCard key={p.id} p={p} index={i} />
                ))
              )}
            </div>

            {!loading && filteredProducts.length === 0 && (
              <div className="h-96 flex flex-col items-center justify-center text-center p-8 rounded-3xl glass border border-white/5">
                <SlidersHorizontal className="h-12 w-12 text-muted-foreground mb-4 opacity-40" />
                <h3 className="font-display text-lg font-bold">No products match your filters</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                  Try adjusting your checkboxes or search query to find your next sneaker drop.
                </p>
                <button
                  onClick={() => {
                    setSelectedBrands([]);
                    setSearchQuery("");
                  }}
                  className="mt-5 rounded-xl bg-white text-black font-semibold text-xs py-2 px-4 hover:bg-white/90 transition-all cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* Mobile Filter Drawer (slides in from left) */}
      <AnimatePresence>
        {isFilterDrawerOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterDrawerOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Drawer Container */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 bottom-0 w-full max-w-[280px] bg-background/95 backdrop-blur-md border-r border-white/10 p-6 overflow-y-auto flex flex-col gap-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-base font-semibold">
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                </div>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-lg glass hover:bg-white/5 transition-colors cursor-pointer text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Brands Filter */}
                <div className="rounded-2xl glass p-4 border border-white/5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Brands
                  </div>
                  <div className="mt-3 space-y-2">
                    {filtersList[0].options.map((o) => (
                      <label
                        key={o}
                        className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground/80 hover:text-foreground"
                      >
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(o)}
                          onChange={() => handleBrandChange(o)}
                          className="h-4 w-4 rounded border-white/20 bg-white/5 accent-[oklch(0.62_0.21_285)] cursor-pointer"
                        />
                        {o}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rest of the static options for decoration */}
                {filtersList.slice(1).map((f) => (
                  <div key={f.label} className="rounded-2xl glass p-4 border border-white/5 opacity-60">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      {f.label}
                    </div>
                    <div className="mt-3 space-y-2">
                      {f.options.map((o) => (
                        <label
                          key={o}
                          className="flex cursor-not-allowed items-center gap-2.5 text-sm text-foreground/50"
                        >
                          <input
                            type="checkbox"
                            disabled
                            className="h-4 w-4 rounded border-white/10 bg-white/5"
                          />
                          {o}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
