import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import {
  ArrowLeft,
  Star,
  ShoppingBag,
  Plus,
  Minus,
  Send,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$productId")({
  head: ({ params }) => ({
    meta: [
      { title: `Sneaker Details — Teens Emporium` },
      { name: "description", content: "View sneaker drops, ratings, and checkout options." },
    ],
  }),
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { productId } = Route.useParams();
  const { products, wishlist, toggleWishlist, addToCart, reviews, addReview, siteSettings } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedSize, setSelectedSize] = useState("US 9");
  const [quantity, setQuantity] = useState(1);

  // Review states
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const p = products.find((prod) => prod.id === productId);

  if (!p) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center pt-32 pb-24 px-4">
          <div className="text-center rounded-3xl glass border border-white/10 p-8 max-w-sm">
            <h1 className="font-display text-4xl font-black mb-4">404</h1>
            <p className="text-sm text-muted-foreground mb-6">
              The sneaker drop you're looking for doesn't exist or was removed.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-xl bg-white text-black px-5 py-2.5 text-xs font-bold transition-all"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Shop
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  const productReviews = reviews.filter((r) => r.productId === p.id);
  const isLiked = wishlist.includes(p.id);

  const averageRating = productReviews.length > 0 
    ? parseFloat((productReviews.reduce((acc, r) => acc + r.rating, 0) / productReviews.length).toFixed(1))
    : p.rating;

  const handleAddToCart = () => {
    addToCart(p.id, quantity, selectedSize);
    toast.success(`Added ${quantity} pair(s) (Size: ${selectedSize}) to cart!`);
  };

  const generateWhatsAppBookUrl = () => {
    const encoded = encodeURIComponent(
      `Hi Teens Emporium! I would like to book this drop:\n\n` +
      `👟 Brand: ${p.brand}\n` +
      `🏷️ Name: ${p.name}\n` +
      `📏 Size: ${selectedSize}\n` +
      `🔢 Qty: ${quantity}\n` +
      `💵 Price: $${p.price} each (Total: $${p.price * quantity})\n` +
      `🔗 Product Link: ${window.location.href}\n\n` +
      `Please confirm my booking!`
    );
    let selectedPhone = siteSettings.whatsappNumber;
    if (siteSettings.whatsappNumber2) {
      selectedPhone = Math.random() < 0.5 ? siteSettings.whatsappNumber : siteSettings.whatsappNumber2;
    }
    const phone = selectedPhone.replace(/[^0-9+]/g, "");
    return `https://wa.me/${phone}?text=${encoded}`;
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error("Please enter a review details.");
      return;
    }

    setSubmittingReview(true);
    try {
      await addReview(p.id, newRating, newComment);
      setNewComment("");
      setNewRating(5);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow mx-auto w-full max-w-7xl px-4 sm:px-6 pt-32 lg:pt-40 pb-24">
        {/* Breadcrumb back navigation */}
        <div className="mb-8">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4.5 w-4.5" /> Back to Shop Directory
          </Link>
        </div>

        {/* Core Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Product Image with badges */}
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-white/5 border border-white/10 group">
            <img src={p.image} alt={p.name} className="h-full w-full object-cover select-none" />
            <div className="absolute left-4 top-4 flex flex-col gap-1.5">
              {p.badge && (
                <span className="rounded-full bg-[image:var(--gradient-primary)] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  {p.badge}
                </span>
              )}
              {discount > 0 && (
                <span className="rounded-full glass-strong px-3.5 py-1.5 text-[10px] font-bold text-[oklch(0.78_0.16_220)]">
                  -{discount}% OFF
                </span>
              )}
            </div>
            {/* Wishlist toggle */}
            <button
              onClick={() => toggleWishlist(p.id)}
              className={cn(
                "absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full glass hover:bg-white/10 transition-all cursor-pointer",
                isLiked && "bg-white/10"
              )}
            >
              <Star
                className={cn(
                  "h-5 w-5 transition-colors",
                  isLiked ? "fill-[oklch(0.78_0.16_220)] text-[oklch(0.78_0.16_220)]" : "text-white"
                )}
              />
            </button>
          </div>

          {/* Right Column: Descriptions & Operations */}
          <div className="text-left space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                {p.brand}
              </span>
              <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight mt-1">
                {p.name}
              </h1>

              {/* Rating count indicator */}
              <div className="flex items-center gap-2 mt-3">
                <div className="flex text-[oklch(0.78_0.16_220)]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4.5 w-4.5",
                        i < Math.round(p.rating)
                        i < Math.round(averageRating)
                          ? "fill-current text-[oklch(0.78_0.16_220)]"
                          : "text-white/20"
                      )}
                    />
                  ))}
                </div>
                <span className="font-semibold text-white">
                  {averageRating.toFixed(1)} / 5.0 Rating · ({productReviews.length} customer reviews)
                </span>
              </div>
            </div>

            <div className="flex items-baseline gap-4 py-2 border-y border-white/5">
              <span className="font-display text-3xl font-bold">${p.price}</span>
              {p.oldPrice && (
                <span className="text-base text-muted-foreground line-through">${p.oldPrice}</span>
              )}
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Step into the future with {p.brand}'s signature premium series. This drop features
                authentic structural panels, responsive footbed engineering, and curated colorways 
                crafted for ultimate durability, comfort, and culture on the move.
              </p>

              {/* Shopping Features/Guarantees list */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 rounded-2xl glass border border-white/5">
                  <ShieldCheck className="h-4.5 w-4.5 text-[oklch(0.78_0.16_220)] shrink-0" />
                  <span>100% Authentic</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 rounded-2xl glass border border-white/5">
                  <Truck className="h-4.5 w-4.5 text-[oklch(0.78_0.16_220)] shrink-0" />
                  <span>Free Express Delivery</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 rounded-2xl glass border border-white/5">
                  <RotateCcw className="h-4.5 w-4.5 text-[oklch(0.78_0.16_220)] shrink-0" />
                  <span>7-Day Return policy</span>
                </div>
              </div>
            </div>

            {/* Sizes Selection */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Select Size
              </span>
              <div className="flex flex-wrap gap-2.5">
                {["US 7", "US 8", "US 9", "US 10", "US 11", "US 12"].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "px-4 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer",
                      selectedSize === size
                        ? "bg-white text-black border-white"
                        : "bg-white/5 text-muted-foreground border-white/10 hover:text-white hover:border-white/20"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Qty adjustments */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Quantity
              </span>
              <div className="flex items-center rounded-xl bg-white/5 border border-white/10 p-0.5 w-max">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="grid h-9 w-9 place-items-center text-muted-foreground hover:text-white cursor-pointer"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center text-sm font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="grid h-9 w-9 place-items-center text-muted-foreground hover:text-white cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white text-black hover:bg-white/90 py-3.5 text-sm font-bold tracking-wide transition-all shadow-lg hover:shadow-white/5 cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" /> Add to Cart
              </button>
                <a
                  href={selectedSize ? generateWhatsAppBookUrl() : "#"}
                  onClick={(e) => {
                    if (!selectedSize) {
                      e.preventDefault();
                      toast.error("Please select a size first");
                      return;
                    }
                    toast.success("Opening WhatsApp for order confirmation...");
                  }}
                  className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white py-4 px-6 text-sm sm:text-base font-bold tracking-wide transition-all shadow-lg hover:shadow-emerald-900/10 cursor-pointer"
                >
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.597 1.455 5.621 1.456 5.485 0 9.948-4.614 9.95-10.28.002-2.743-1.06-5.321-2.993-7.257C17.29 1.339 14.713.275 11.99.275 6.505.275 2.04 4.887 2.038 10.556c0 2.03.529 4.021 1.532 5.795L2.57 21.03l4.757-1.246-.68-.63z" />
                  </svg>
                  Book via WhatsApp
                </a>
            </div>
          </div>
        </div>

        {/* Lower Section: Reviews Feed list & Review Form */}
        <div className="mt-20 pt-10 border-t border-white/5 grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Left Column (3 cols): Reviews Feed */}
          <div className="lg:col-span-3 text-left space-y-6">
            <h3 className="font-display text-2xl font-black">Reviews & Feedback</h3>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-3">
              {productReviews.map((r) => (
                <div
                  key={r.id}
                  className="p-5 rounded-2xl glass border border-white/5 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm block">{r.userName}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex text-[oklch(0.78_0.16_220)]">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-4 w-4",
                            i < r.rating
                              ? "fill-current text-[oklch(0.78_0.16_220)]"
                              : "text-white/10"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{r.comment}</p>
                </div>
              ))}

              {productReviews.length === 0 && (
                <div className="p-12 text-center text-xs text-muted-foreground bg-white/[0.01] border border-dashed border-white/10 rounded-3xl">
                  There are no reviews yet for these sneakers. Be the first to share your thoughts!
                </div>
              )}
            </div>
          </div>

          {/* Right Column (2 cols): Submit Review Form */}
          <div className="lg:col-span-2 text-left space-y-6">
            <h3 className="font-display text-2xl font-black">Share your experience</h3>

            <form
              onSubmit={handleReviewSubmit}
              className="p-6 rounded-2xl glass border border-white/10 space-y-5"
            >
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Select Rating
                </label>
                <div className="flex gap-2 text-3xl mt-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="cursor-pointer transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        className={cn(
                          "h-7 w-7 transition-colors",
                          star <= newRating
                            ? "fill-[oklch(0.78_0.16_220)] text-[oklch(0.78_0.16_220)]"
                            : "text-white/20"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Review Comment
                </label>
                <textarea
                  rows={4}
                  placeholder={
                    user
                      ? "Describe your experience (comfort, fit, materials, size accuracy)..."
                      : "Write your review comment here..."
                  }
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-xs outline-none focus:border-white/20 transition-colors resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-white text-black hover:bg-white/90 disabled:bg-white/50 py-3 text-xs font-bold tracking-wide transition-all shadow-md cursor-pointer"
              >
                <Send className="h-4 w-4" />
                {submittingReview ? "Submitting review..." : "Submit Review"}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
