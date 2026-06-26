import { useState } from "react";
import { Heart, Eye, ShoppingBag, Star, X, Plus, Minus, Send } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "@/context/AppContext";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type Product = {
  id: string;
  brand: string;
  name: string;
  price: number;
  oldPrice?: number;
  rating: number;
  image: string;
  badge?: string;
};

export function ProductCard({ p, index = 0 }: { p: Product; index?: number }) {
  const { wishlist, toggleWishlist, addToCart, reviews, addReview, siteSettings } = useApp();
  const { user } = useAuth();
  
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState("US 9");
  const [quantity, setQuantity] = useState(1);
  
  // Review submission states
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const isLiked = wishlist.includes(p.id);
  const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  
  // Filter reviews for this product
  const productReviews = reviews.filter((r) => r.productId === p.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(p.id, 1, "US 9");
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist(p.id);
  };

  const handleModalAddToCart = () => {
    addToCart(p.id, quantity, selectedSize);
    setIsQuickViewOpen(false);
  };

  const generateWhatsAppSingleBookUrl = () => {
    const productUrl = `${window.location.origin}/product/${p.id}`;
    const message = `Hi Teens Emporium! I would like to book this drop:\n\n` +
      `👟 Brand: ${p.brand}\n` +
      `🏷️ Name: ${p.name}\n` +
      `📏 Size: ${selectedSize}\n` +
      `🔢 Qty: ${quantity}\n` +
      `💵 Price: $${p.price} each (Total: $${p.price * quantity})\n` +
      `🔗 Product Link: ${productUrl}\n\n` +
      `Please confirm my booking!`;
    const encodedMessage = encodeURIComponent(message);
    let selectedPhone = siteSettings.whatsappNumber;
    if (siteSettings.whatsappNumber2) {
      selectedPhone = Math.random() < 0.5 ? siteSettings.whatsappNumber : siteSettings.whatsappNumber2;
    }
    const phoneNumber = selectedPhone.replace(/[^0-9+]/g, "");
    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error("Please write a review comment.");
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
    <>
      <motion.article
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, delay: index * 0.05 }}
        className="group relative overflow-hidden rounded-2xl glass hover-lift border border-white/5"
      >
        <div className="relative aspect-square overflow-hidden">
          <Link to="/product/$productId" params={{ productId: p.id }} className="block h-full w-full">
            <img
              src={p.image}
              alt={p.name}
              loading="lazy"
              width={800}
              height={800}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </Link>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {p.badge && (
              <span className="rounded-full bg-[image:var(--gradient-primary)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                {p.badge}
              </span>
            )}
            {discount > 0 && (
              <span className="rounded-full glass-strong px-2.5 py-1 text-[10px] font-bold text-[oklch(0.78_0.16_220)]">
                -{discount}%
              </span>
            )}
          </div>
          <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <CircleBtn
              label="Wishlist"
              onClick={handleWishlistToggle}
              className={cn(isLiked && "bg-white/10")}
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-colors duration-300",
                  isLiked ? "fill-[oklch(0.62_0.21_285)] text-[oklch(0.62_0.21_285)]" : "text-white"
                )}
              />
            </CircleBtn>
            <CircleBtn
              label="Quick view"
              onClick={(e) => {
                e.preventDefault();
                setIsQuickViewOpen(true);
              }}
            >
              <Eye className="h-4 w-4 text-white" />
            </CircleBtn>
          </div>
          <button
            onClick={handleAddToCart}
            className="absolute inset-x-3 bottom-3 inline-flex translate-y-3 items-center justify-center gap-2 rounded-xl bg-white/95 px-4 py-2.5 text-xs font-semibold text-black opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 cursor-pointer hover:bg-white"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Add to Cart
          </button>
        </div>

        <div className="p-4 text-left">
          <Link to="/product/$productId" params={{ productId: p.id }} className="block group/link">
            <div className="flex items-center justify-between">
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{p.brand}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-[oklch(0.78_0.16_220)] text-[oklch(0.78_0.16_220)]" />
                {p.rating}
              </div>
            </div>
            <h3 className="mt-1.5 line-clamp-1 font-display text-base font-bold text-white group-hover/link:text-muted-foreground transition-colors">
              {p.name}
            </h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-lg font-bold">${p.price}</span>
              {p.oldPrice && (
                <span className="text-xs text-muted-foreground line-through">${p.oldPrice}</span>
              )}
            </div>
          </Link>
        </div>
      </motion.article>

      {/* --- QUICK VIEW / DETAIL MODAL --- */}
      <AnimatePresence>
        {isQuickViewOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
            {/* Dismiss area */}
            <div className="absolute inset-0 cursor-pointer" onClick={() => setIsQuickViewOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl rounded-3xl glass-strong border border-white/15 p-6 sm:p-8 relative z-10 my-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsQuickViewOpen(false)}
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-xl glass hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Upper Section: Image & Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 border-b border-white/10">
                {/* Left: Image */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                  {p.badge && (
                    <span className="absolute left-4 top-4 rounded-full bg-[image:var(--gradient-primary)] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                      {p.badge}
                    </span>
                  )}
                </div>

                {/* Right: Details & Purchase Options */}
                <div className="text-left flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      {p.brand}
                    </span>
                    <h2 className="font-display text-2xl sm:text-3xl font-black mt-1">{p.name}</h2>

                    {/* Rating display */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="flex text-[oklch(0.78_0.16_220)]">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-4 w-4",
                              i < Math.round(p.rating) ? "fill-current text-[oklch(0.78_0.16_220)]" : "text-white/20"
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground">
                        {p.rating} / 5.0 ({productReviews.length} reviews)
                      </span>
                    </div>

                    <div className="mt-4 flex items-baseline gap-3">
                      <span className="font-display text-2xl sm:text-3xl font-bold">${p.price}</span>
                      {p.oldPrice && (
                        <span className="text-sm text-muted-foreground line-through">${p.oldPrice}</span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
                      Experience the ultimate style and comfort signature of premium street fashion. 
                      Crafted with high-grade leather, detailed stitching, and advanced responsive cushioning 
                      for elite wear.
                    </p>

                    {/* Size Selector */}
                    <div className="mt-6">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Select Size
                      </span>
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        {["US 7", "US 8", "US 9", "US 10", "US 11", "US 12"].map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={cn(
                              "px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer",
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

                    {/* Quantity Selector */}
                    <div className="mt-5">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Quantity
                      </span>
                      <div className="mt-2 flex items-center rounded-xl bg-white/5 border border-white/10 p-0.5 w-max">
                        <button
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          className="grid h-8 w-8 place-items-center text-muted-foreground hover:text-white cursor-pointer"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold">{quantity}</span>
                        <button
                          onClick={() => setQuantity((q) => q + 1)}
                          className="grid h-8 w-8 place-items-center text-muted-foreground hover:text-white cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Booking Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
                    <button
                      onClick={handleModalAddToCart}
                      className="flex items-center justify-center gap-2 rounded-xl bg-white text-black hover:bg-white/90 py-3 text-sm font-bold tracking-wide transition-all shadow-lg hover:shadow-white/5 cursor-pointer"
                    >
                      <ShoppingBag className="h-4 w-4" /> Add to Cart
                    </button>
                    <a
                      href={selectedSize ? generateWhatsAppSingleBookUrl() : "#"}
                      onClick={(e) => {
                        if (!selectedSize) {
                          e.preventDefault();
                          toast.error("Please select a size first!");
                          return;
                        }
                        toast.success("Redirecting to WhatsApp to complete booking...");
                        setIsQuickViewOpen(false);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white py-3 text-sm font-bold tracking-wide transition-all shadow-lg hover:shadow-emerald-900/10"
                    >
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.597 1.455 5.621 1.456 5.485 0 9.948-4.614 9.95-10.28.002-2.743-1.06-5.321-2.993-7.257C17.29 1.339 14.713.275 11.99.275 6.505.275 2.04 4.887 2.038 10.556c0 2.03.529 4.021 1.532 5.795L2.57 21.03l4.757-1.246-.68-.63z" />
                      </svg>
                      Book via WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              {/* Lower Section: Ratings & Reviews list & Submit */}
              <div className="pt-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left 3 cols: Reviews List */}
                <div className="lg:col-span-3 text-left space-y-4">
                  <h3 className="font-display text-lg font-bold">
                    Reviews ({productReviews.length})
                  </h3>

                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {productReviews.map((r) => (
                      <div key={r.id} className="p-4 rounded-2xl glass border border-white/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-sm block">{r.userName}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(r.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-0.5 text-[oklch(0.78_0.16_220)]">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "h-3.5 w-3.5",
                                  i < r.rating ? "fill-current text-[oklch(0.78_0.16_220)]" : "text-white/10"
                                )}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{r.comment}</p>
                      </div>
                    ))}
                    {productReviews.length === 0 && (
                      <div className="p-8 text-center text-xs text-muted-foreground bg-white/[0.02] border border-dashed border-white/10 rounded-2xl">
                        Be the first to review this product!
                      </div>
                    )}
                  </div>
                </div>

                {/* Right 2 cols: Write Review Form */}
                <div className="lg:col-span-2 text-left space-y-4">
                  <h3 className="font-display text-lg font-bold">Share your feedback</h3>

                  <form onSubmit={handleReviewSubmit} className="space-y-4 p-4 rounded-2xl glass border border-white/5">
                    {/* Star selection */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Your Rating
                      </label>
                      <div className="flex gap-1.5 text-2xl mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            className="cursor-pointer transition-transform hover:scale-110 focus:outline-none"
                          >
                            <Star
                              className={cn(
                                "h-6 w-6 transition-colors",
                                star <= newRating
                                  ? "fill-[oklch(0.78_0.16_220)] text-[oklch(0.78_0.16_220)]"
                                  : "text-white/20"
                              )}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Comment text */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Review details
                      </label>
                      <textarea
                        rows={3}
                        placeholder={
                          user
                            ? "Tell us what you like or dislike about these sneakers..."
                            : "Write a review (Note: guests can review anonymously)..."
                        }
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs outline-none focus:border-white/20 transition-colors resize-none"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-white text-black hover:bg-white/90 disabled:bg-white/50 py-2.5 text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" />
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function CircleBtn({
  children,
  label,
  className,
  ...rest
}: {
  children: React.ReactNode;
  label: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      aria-label={label}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-full glass-strong hover:bg-white/20 transition-colors cursor-pointer",
        className
      )}
    >
      {children}
    </button>
  );
}
