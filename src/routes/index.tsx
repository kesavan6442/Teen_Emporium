import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Brands } from "@/components/site/Brands";
import { NewArrivals } from "@/components/site/NewArrivals";
import { Trending } from "@/components/site/Trending";
import { Newsletter } from "@/components/site/Newsletter";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Teens Emporium — Premium Sneakers, Curated." },
      { name: "description", content: "Premium sneaker destination. Discover authentic drops from Nike, Jordan, Adidas, Puma, New Balance, and more." },
      { property: "og:title", content: "Teens Emporium — Premium Sneakers, Curated." },
      { property: "og:description", content: "Authentic premium sneakers from the world's leading brands." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <Brands />
        <NewArrivals />
        <Trending />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
