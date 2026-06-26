import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  Plus,
  Minus,
  Trash2,
  LogOut,
  Shield,
  CreditCard,
  Package,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useApp, ShippingDetails } from "@/context/AppContext";
import { toast } from "sonner";
import { Product } from "@/components/site/ProductCard";

const links = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const { cart, wishlist, updateCartQty, removeFromCart, clearCart, siteSettings, products, orders, placeOrder } = useApp();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false); // Mobile menu open state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Advanced Overlay States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);

  // Selected product state for Search detail modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Close profile dropdown on outside click
    const handleOutsideClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    window.addEventListener("mousedown", handleOutsideClick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist.length;
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);
  const finalTotal = cartSubtotal - Math.round((cartSubtotal * siteSettings.discountPercent) / 100);

  // Filter orders for the logged-in customer
  const customerOrders = orders.filter(
    (o) => o.userEmail === user?.email || o.userId === user?.uid
  );

  // Filter products for navbar instant search
  const searchResults = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }
    const orderItemsText = cart
      .map(
        (item) =>
          `👟 Brand: ${item.product?.brand}\n` +
          `🏷️ Name: ${item.product?.name}\n` +
          `📏 Size: ${item.size}\n` +
          `🔢 Qty: ${item.quantity}\n` +
          `💵 Price: $${item.product?.price} each\n` +
          `🖼️ Image: ${item.product?.image}\n` +
          `🔗 Link: ${window.location.origin}/product/${item.productId}`
      )
      .join("\n\n");

    const message = `Hi Teens Emporium! I would like to book these drops from my cart:\n\n${orderItemsText}\n\n💵 Total Price: $${finalTotal}\n\nPlease confirm my order booking!`;
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = siteSettings.whatsappNumber.replace(/[^0-9+]/g, ""); // sanitize number
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
    toast.success("Redirecting to WhatsApp to complete booking...");
    setIsCartOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully.");
      setIsProfileOpen(false);
      navigate({ to: "/" });
    } catch (err: any) {
      toast.error("Failed to log out.");
    }
  };

  const handleProfileClick = () => {
    if (user) {
      setIsProfileOpen((prev) => !prev);
    } else {
      navigate({ to: "/auth" });
    }
  };

  const handleWishlistClick = () => {
    if (wishlist.length === 0) {
      toast.info("Your wishlist is empty. Tap the heart on products you love!");
    } else {
      toast.success(`You have ${wishlistCount} item(s) in your wishlist!`);
      navigate({ to: "/shop" });
    }
  };

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 z-40 transition-all duration-500 top-0",
          scrolled ? "py-3" : "py-5"
        )}
      >
        <div
          className={cn(
            "mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 transition-all duration-500",
            scrolled && "glass-strong rounded-2xl px-4 sm:px-5 mx-3 sm:mx-6"
          )}
        >
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[image:var(--gradient-primary)] glow-primary">
              <span className="font-display text-sm font-black text-white">T</span>
            </div>
            <div className="leading-none">
              <div className="font-display text-sm font-bold tracking-[0.2em]">TEENS</div>
              <div className="font-display text-[10px] tracking-[0.4em] text-muted-foreground">
                EMPORIUM
              </div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-7 text-sm">
            {links.map((l, i) => (
              <Link
                key={i}
                to={l.to}
                className="relative text-muted-foreground hover:text-foreground transition-colors after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-[image:var(--gradient-primary)] hover:after:w-full after:transition-all"
              >
                {l.label}
              </Link>
            ))}
            {user?.role === "admin" && (
              <Link
                to="/admin"
                className="relative text-amber-400/90 hover:text-amber-300 font-bold transition-colors"
              >
                Admin Panel
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2 relative">
            <IconBtn aria-label="Search" onClick={() => setIsSearchOpen(true)}>
              <Search className="h-4 w-4" />
            </IconBtn>
            <IconBtn aria-label="Wishlist" badge={wishlistCount} onClick={handleWishlistClick}>
              <Heart className="h-4 w-4" />
            </IconBtn>
            <IconBtn aria-label="Cart" badge={cartCount} onClick={() => setIsCartOpen(true)}>
              <ShoppingBag className="h-4 w-4" />
            </IconBtn>

            {/* Profile trigger */}
            <div ref={profileRef} className="relative">
              <IconBtn
                aria-label="Profile"
                onClick={handleProfileClick}
                className={cn(user && "border-[oklch(0.62_0.21_285)]/40")}
              >
                <User className="h-4 w-4" />
              </IconBtn>

              {/* Profile dropdown menu */}
              {isProfileOpen && user && (
                <div className="absolute right-0 mt-3 w-56 rounded-2xl glass-strong border border-white/10 p-2 shadow-2xl animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-white/5 text-left mb-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Logged in as
                    </p>
                    <p className="text-sm font-bold truncate mt-0.5">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsOrdersOpen(true);
                      setIsProfileOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-white/5 transition-colors text-left"
                  >
                    <Package className="h-4 w-4" /> My Orders
                  </button>
                  {user.role === "admin" && (
                    <Link
                      to="/admin"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-amber-400 hover:text-amber-300 hover:bg-white/5 transition-colors text-left font-semibold"
                    >
                      <Shield className="h-4 w-4" /> Admin Console
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors text-left"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setOpen((o) => !o)}
              className="lg:hidden grid h-9 w-9 place-items-center rounded-xl glass hover:bg-white/5"
              aria-label="Menu"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden mx-3 mt-2 glass-strong rounded-2xl p-4 animate-in fade-in slide-in-from-top-2">
            <div className="grid gap-1">
              {links.map((l, i) => (
                <Link
                  key={i}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5"
                >
                  {l.label}
                </Link>
              ))}
              {user && (
                <button
                  onClick={() => {
                    setIsOrdersOpen(true);
                    setOpen(false);
                  }}
                  className="w-full text-left rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 flex items-center gap-2"
                >
                  <Package className="h-4 w-4" /> My Orders
                </button>
              )}
              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm text-amber-400 hover:bg-white/5"
                >
                  Admin Panel
                </Link>
              )}
              {!user && (
                <Link
                  to="/auth"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm text-foreground font-bold hover:bg-white/5"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* --- CART SLIDE-OVER DRAWER --- */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setIsCartOpen(false)} />

          <div className="w-full max-w-md h-full glass-strong border-l border-white/10 flex flex-col justify-between relative z-10 animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl font-bold flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                  Your Cart
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {cartCount} item(s) selected
                </p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg glass hover:bg-white/5 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 rounded-2xl glass border border-white/5 items-center justify-between"
                >
                  <div className="flex gap-3 items-center">
                    <img
                      src={item.product?.image}
                      alt={item.product?.name}
                      className="h-16 w-16 rounded-xl object-cover bg-white/5 border border-white/10"
                    />
                    <div className="text-left">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                        {item.product?.brand}
                      </span>
                      <h4 className="text-sm font-bold line-clamp-1">{item.product?.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Size: {item.size}</p>
                      <p className="text-sm font-bold mt-1">${item.product?.price}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <div className="flex items-center rounded-lg bg-white/5 border border-white/10 p-0.5">
                      <button
                        onClick={() => updateCartQty(item.id, item.quantity - 1)}
                        className="grid h-6 w-6 place-items-center text-muted-foreground hover:text-white"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQty(item.id, item.quantity + 1)}
                        className="grid h-6 w-6 place-items-center text-muted-foreground hover:text-white"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="h-64 flex flex-col items-center justify-center text-center">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground mb-3 opacity-40" />
                  <span className="font-semibold text-sm">Cart is empty</span>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                    Looks like you haven't added any sneaker drops yet.
                  </p>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-white/[0.01] space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="text-foreground font-semibold">${cartSubtotal}</span>
                  </div>

                  {siteSettings.discountPercent > 0 && (
                    <div className="flex justify-between text-xs text-emerald-400">
                      <span>Promo Discount ({siteSettings.discountCode})</span>
                      <span>-${Math.round((cartSubtotal * siteSettings.discountPercent) / 100)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-base font-bold pt-2 border-t border-white/5">
                    <span>Total</span>
                    <span>${finalTotal}</span>
                  </div>
                </div>

                <button
                  onClick={handleWhatsAppCheckout}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white py-3 text-sm font-bold tracking-wide transition-all shadow-lg hover:shadow-emerald-900/10 cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.597 1.455 5.621 1.456 5.485 0 9.948-4.614 9.95-10.28.002-2.743-1.06-5.321-2.993-7.257C17.29 1.339 14.713.275 11.99.275 6.505.275 2.04 4.887 2.038 10.556c0 2.03.529 4.021 1.532 5.795L2.57 21.03l4.757-1.246-.68-.63z" />
                  </svg>
                  Book via WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- SEARCH OVERLAY --- */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <button
            onClick={() => {
              setIsSearchOpen(false);
              setSearchQuery("");
            }}
            className="absolute right-6 top-6 grid h-10 w-10 place-items-center rounded-xl glass hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="w-full max-w-2xl text-center space-y-6">
            <h3 className="font-display text-2xl font-black text-white">Search Teens Emporium</h3>
            <div className="relative">
              <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                autoFocus
                placeholder="Type brand, style, or name (e.g. Jordan, Premium)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    setIsSearchOpen(false);
                    const q = searchQuery;
                    setSearchQuery("");
                    navigate({ to: "/shop", search: { search: q } });
                  }
                }}
                className="w-full rounded-2xl bg-white/5 border border-white/10 pl-12 pr-4 py-3.5 text-base outline-none focus:border-white/20 transition-all text-white"
              />
            </div>

            {/* Instant suggestions list */}
            {searchResults.length > 0 && (
              <div className="rounded-2xl glass border border-white/15 overflow-hidden max-h-[350px] overflow-y-auto p-2 space-y-1 text-left">
                {searchResults.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                      navigate({
                        to: "/product/$productId",
                        params: { productId: p.id },
                      });
                    }}
                    className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors text-left"
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-12 w-12 rounded-lg object-cover bg-white/5 border border-white/10"
                    />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                        {p.brand}
                      </span>
                      <h4 className="text-sm font-bold text-white leading-tight">{p.name}</h4>
                      <span className="text-xs text-muted-foreground">${p.price}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {searchQuery && searchResults.length === 0 && (
              <p className="text-sm text-muted-foreground">No matches found. Try another query.</p>
            )}
          </div>
        </div>
      )}

      {/* --- MY ORDERS TRACKING MODAL --- */}
      {isOrdersOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setIsOrdersOpen(false)} />

          <div className="w-full max-w-2xl rounded-3xl glass-strong border border-white/15 p-6 sm:p-8 relative z-10 my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsOrdersOpen(false)}
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg glass hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="font-display text-2xl font-black mb-6 text-left flex items-center gap-2">
              <Package className="h-6 w-6 text-muted-foreground" />
              Order Tracking & History
            </h3>

            <div className="space-y-4 text-left max-h-[500px] overflow-y-auto pr-2">
              {customerOrders.map((o) => (
                <div
                  key={o.id}
                  className="p-5 rounded-2xl glass border border-white/5 space-y-3 hover:border-white/10 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-2.5 gap-2">
                    <div>
                      <span className="text-[10px] text-muted-foreground block uppercase font-bold">
                        Order ID: #{o.id.slice(-6)}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3" />
                        {new Date(o.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="text-xs text-muted-foreground font-semibold">
                        Paid: <strong>${o.total}</strong>
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase border",
                          o.status === "Pending" && "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
                          o.status === "Processing" && "bg-blue-500/10 border-blue-500/20 text-blue-400",
                          o.status === "Shipped" && "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
                          o.status === "Delivered" && "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                          o.status === "Cancelled" && "bg-red-500/10 border-red-500/20 text-red-400"
                        )}
                      >
                        {o.status}
                      </span>
                    </div>
                  </div>

                  {/* Visual Tracker (stepper) */}
                  {o.status !== "Cancelled" && (
                    <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl space-y-3">
                      <div className="flex justify-between text-[9px] uppercase tracking-wider text-muted-foreground font-bold px-1">
                        <span className={cn(o.status === "Pending" ? "text-yellow-400 font-extrabold" : "text-muted-foreground/60")}>1. Placed</span>
                        <span className={cn(o.status === "Processing" ? "text-blue-400 font-extrabold" : "text-muted-foreground/60")}>2. Accepted</span>
                        <span className={cn(o.status === "Shipped" ? "text-indigo-400 font-extrabold" : "text-muted-foreground/60")}>3. Shipped</span>
                        <span className={cn(o.status === "Delivered" ? "text-emerald-400 font-extrabold" : "text-muted-foreground/60")}>4. Delivered</span>
                      </div>
                      <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "absolute left-0 top-0 bottom-0 transition-all duration-700 rounded-full",
                            o.status === "Pending" && "w-[12%] bg-yellow-500",
                            o.status === "Processing" && "w-[40%] bg-blue-500",
                            o.status === "Shipped" && "w-[72%] bg-indigo-500",
                            o.status === "Delivered" && "w-full bg-emerald-500"
                          )}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground italic pl-1 leading-none">
                        Status Description:{" "}
                        {o.status === "Pending" && "Order placed! Waiting for the admin to confirm."}
                        {o.status === "Processing" && "Confirmed! The store admin has accepted your order and is processing it."}
                        {o.status === "Shipped" && "On the way! Your drop has been shipped and is heading to your address."}
                        {o.status === "Delivered" && "Delivered! Your sneakers have arrived."}
                      </p>
                    </div>
                  )}

                  {/* Items list */}
                  <div className="space-y-2">
                    {o.items.map((item, idx) => (
                      <div key={idx} className="flex gap-3 items-center justify-between text-xs">
                        <div className="flex gap-2 items-center">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-8 w-8 rounded-lg object-cover bg-white/5 border border-white/10"
                          />
                          <div>
                            <span className="font-bold">{item.brand} {item.name}</span>
                            <span className="text-[10px] text-muted-foreground ml-1.5">
                              (Size: {item.size}, Qty: {item.quantity})
                            </span>
                          </div>
                        </div>
                        <span className="text-muted-foreground">${item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Shipping address details */}
                  <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl text-[10px] text-muted-foreground flex flex-col sm:flex-row justify-between gap-2">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3" />
                      {o.shippingDetails.address}, {o.shippingDetails.city}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3 w-3" />
                      {o.shippingDetails.phone}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3 w-3" />
                      {o.userEmail}
                    </span>
                  </div>
                </div>
              ))}

              {customerOrders.length === 0 && (
                <div className="p-12 text-center text-xs text-muted-foreground bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
                  No orders found. Add drops to your cart and place an order!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Loader2({ className }: { className?: string }) {
  return <Loader className={cn("animate-spin", className)} />;
}

function Loader({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="24" height="24">
      <path
        fill="currentColor"
        d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,20a9,9,0,1,1,9-9A9,9,0,0,1,12,21Z"
        style={{ opacity: 0.15 }}
      />
      <path
        fill="currentColor"
        d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,1,0,21.38,10,11,11,0,0,0,12,1a1.5,1.5,0,0,0,0,3Z"
      />
    </svg>
  );
}

function IconBtn({
  children,
  badge,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { badge?: number }) {
  return (
    <button
      {...rest}
      className={cn(
        "relative grid h-9 w-9 place-items-center rounded-xl glass hover:bg-white/5 transition-colors cursor-pointer",
        className
      )}
    >
      {children}
      {badge ? (
        <span className="absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-[image:var(--gradient-primary)] px-1 text-[9px] font-bold text-white leading-none">
          {badge}
        </span>
      ) : null}
    </button>
  );
}
