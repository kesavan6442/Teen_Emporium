import { ProductCard, type Product } from "./ProductCard";
import { SectionHeading } from "./Brands";
import { Link } from "@tanstack/react-router";
import s1 from "@/assets/sneaker-1.jpg";
import s2 from "@/assets/sneaker-2.jpg";
import s3 from "@/assets/sneaker-3.jpg";
import s4 from "@/assets/sneaker-4.jpg";
import { useApp } from "@/context/AppContext";



export function NewArrivals() {
  const { products } = useApp();
  
  // Show the 8 newest products
  const latestProducts = [...products].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 8);

  return (
    <section className="relative mx-auto max-w-7xl px-4 sm:px-6 py-24">
      <div className="flex items-end justify-between gap-6">
        <SectionHeading
          eyebrow="New Arrivals"
          title="Fresh on the floor"
          sub="The latest drops, hand-picked by our buyers this week."
        />
        <Link to="/shop" className="hidden sm:inline-flex text-sm text-muted-foreground hover:text-foreground transition-colors">
          View all →
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {latestProducts.map((p, i) => (
          <ProductCard key={p.id} p={p} index={i} />
        ))}
      </div>
    </section>
  );
}
