import { ProductCard, type Product } from "./ProductCard";
import { SectionHeading } from "./Brands";
import { Link } from "@tanstack/react-router";
import s1 from "@/assets/sneaker-1.jpg";
import s2 from "@/assets/sneaker-2.jpg";
import s3 from "@/assets/sneaker-3.jpg";
import s4 from "@/assets/sneaker-4.jpg";

export const SAMPLE_PRODUCTS: Product[] = [
  { id: "1", brand: "Nike", name: "Air Court Premium", price: 189, oldPrice: 229, rating: 4.8, image: s1, badge: "New" },
  { id: "2", brand: "Jordan", name: "Flight 23 Retro", price: 249, rating: 4.9, image: s2, badge: "Hot" },
  { id: "3", brand: "Adidas", name: "Pulse Runner V2", price: 159, oldPrice: 199, rating: 4.7, image: s3 },
  { id: "4", brand: "Puma", name: "Suede Classic Tan", price: 129, rating: 4.6, image: s4 },
  { id: "5", brand: "New Balance", name: "990v6 Cream", price: 219, rating: 4.9, image: s1, badge: "Limited" },
  { id: "6", brand: "Jordan", name: "AJ1 Bred Mid", price: 199, oldPrice: 239, rating: 4.8, image: s2 },
  { id: "7", brand: "Adidas", name: "Volt Streak", price: 149, rating: 4.5, image: s3 },
  { id: "8", brand: "Puma", name: "Court Sand", price: 109, oldPrice: 139, rating: 4.4, image: s4 },
];

export function NewArrivals() {
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
        {SAMPLE_PRODUCTS.map((p, i) => (
          <ProductCard key={p.id} p={p} index={i} />
        ))}
      </div>
    </section>
  );
}
