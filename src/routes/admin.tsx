import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { cn } from "@/lib/utils";
import {
  Plus,
  Edit2,
  Trash2,
  Settings,
  Package,
  Layers,
  Sparkles,
  FileImage,
  Loader2,
  Lock,
  Unlock,
  Star,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { Product } from "@/components/site/ProductCard";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Control — Teens Emporium" },
      { name: "description", content: "Management console for Teens Emporium" },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { user, isMock } = useAuth();
  const {
    products,
    siteSettings,
    addProduct,
    updateProduct,
    deleteProduct,
    updateSiteSettings,
    orders,
    reviews,
    updateOrderStatus,
    deleteOrder,
    deleteReview,
  } = useApp();
  const navigate = useNavigate();

  // Tab management: "products" | "settings" | "orders" | "reviews"
  const [activeTab, setActiveTab] = useState<"products" | "settings" | "orders" | "reviews">("products");

  // Mock Admin Bypass state for easy local dev testing
  const [mockBypass, setMockBypass] = useState(false);

  // Dialog state for Product Add/Edit
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [dialogLoading, setDialogLoading] = useState(false);

  // Product Form states
  const [brand, setBrand] = useState("");
  const [customBrand, setCustomBrand] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [rating, setRating] = useState("5.0");
  const [badge, setBadge] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  
  const standardBrands = ["Nike", "Jordan", "Adidas", "Puma", "New Balance", "Converse"];

  // Site Settings Form states
  const [announcement, setAnnouncement] = useState(siteSettings.announcement);
  const [promoBanner, setPromoBanner] = useState(siteSettings.promoBanner);
  const [storeOpen, setStoreOpen] = useState(siteSettings.storeOpen);
  const [discountCode, setDiscountCode] = useState(siteSettings.discountCode);
  const [discountPercent, setDiscountPercent] = useState(String(siteSettings.discountPercent));
  const [whatsappNumber, setWhatsappNumber] = useState(siteSettings.whatsappNumber || "");
  const [whatsappNumber2, setWhatsappNumber2] = useState(siteSettings.whatsappNumber2 || "");
  const [statBrands, setStatBrands] = useState(siteSettings.statBrands || "20+");
  const [statPairs, setStatPairs] = useState(siteSettings.statPairs || "10K+");
  const [statRating, setStatRating] = useState(siteSettings.statRating || "4.9★");
  const [settingsLoading, setSettingsLoading] = useState(false);

  useEffect(() => {
    setAnnouncement(siteSettings.announcement || "");
    setPromoBanner(siteSettings.promoBanner || "");
    setStoreOpen(siteSettings.storeOpen);
    setDiscountCode(siteSettings.discountCode || "");
    setDiscountPercent(String(siteSettings.discountPercent || 0));
    setWhatsappNumber(siteSettings.whatsappNumber || "");
    setWhatsappNumber2(siteSettings.whatsappNumber2 || "");
    setStatBrands(siteSettings.statBrands || "20+");
    setStatPairs(siteSettings.statPairs || "10K+");
    setStatRating(siteSettings.statRating || "4.9★");
  }, [siteSettings]);

  // Check auth roles
  const isAdmin = user?.role === "admin" || (isMock && mockBypass);

  const handleOpenAddDialog = () => {
    setEditingProduct(null);
    setBrand("Nike");
    setCustomBrand("");
    setName("");
    setPrice("");
    setOldPrice("");
    setRating("4.8");
    setBadge("New");
    setImageFile(null);
    setImagePreview("");
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setPrice(String(p.price));
    setOldPrice(p.oldPrice ? String(p.oldPrice) : "");
    setRating(String(p.rating));
    setBadge(p.badge || "");
    setImageFile(null);
    setImagePreview(p.image);
    setIsDialogOpen(true);

    if (standardBrands.includes(p.brand)) {
      setBrand(p.brand);
      setCustomBrand("");
    } else {
      setBrand("Custom");
      setCustomBrand(p.brand);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalBrand = brand === "Custom" ? customBrand : brand;
    if (!finalBrand || !name || !price) {
      toast.error("Please fill in required fields.");
      return;
    }

    setDialogLoading(true);
    try {
      const prodData = {
        brand: finalBrand,
        name,
        price: Number(price),
        oldPrice: oldPrice ? Number(oldPrice) : undefined,
        rating: Number(rating),
        badge: badge || undefined,
        image: imagePreview || "https://images.unsplash.com/photo-1542291026-7eec264c27ff", // placeholder if none
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, prodData, imageFile || undefined);
      } else {
        await addProduct(prodData, imageFile || undefined);
      }
      setIsDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save product.");
    } finally {
      setDialogLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
      } catch (err: any) {
        toast.error(err.message || "Failed to delete product.");
      }
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    try {
      await updateSiteSettings({
        announcement: "",
        promoBanner,
        storeOpen,
        discountCode,
        discountPercent: Number(discountPercent),
        whatsappNumber,
        whatsappNumber2,
        statBrands,
        statPairs,
        statRating,
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to update settings.");
    } finally {
      setSettingsLoading(false);
    }
  };

  // Auth Guard display
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
        <Navbar />
        <main className="flex-grow flex items-center justify-center px-4 pt-32 pb-20">
          <div className="w-full max-w-md text-center rounded-3xl glass p-8 sm:p-10 border border-white/10 relative overflow-hidden">
            <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[oklch(0.62_0.21_285)]/10 blur-[80px]" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="h-16 w-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                <Lock className="h-8 w-8 text-muted-foreground animate-pulse" />
              </div>
              <h1 className="font-display text-2xl font-black mb-2">Restricted Access</h1>
              <p className="text-sm text-muted-foreground mb-6">
                You must be logged in as an Administrator to view the dashboard.
              </p>

              <div className="flex flex-col gap-3 w-full">
                {user ? (
                  <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 py-2.5 px-4 rounded-xl mb-2">
                    Logged in as <strong>{user.email}</strong> (Role: {user.role}).
                  </div>
                ) : (
                  <Link
                    to="/auth"
                    className="w-full rounded-xl bg-white text-black hover:bg-white/90 py-2.5 text-sm font-bold tracking-wide transition-all shadow-md"
                  >
                    Go to Login
                  </Link>
                )}

                {isMock && (
                  <button
                    onClick={() => {
                      setMockBypass(true);
                      toast.success("Bypassed admin gate using Local Mock developer mode!");
                    }}
                    className="w-full rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 py-2.5 text-sm font-semibold tracking-wide transition-all flex items-center justify-center gap-2"
                  >
                    <Unlock className="h-4 w-4" />
                    Bypass for Local Testing (Mock)
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow mx-auto w-full max-w-7xl px-4 sm:px-6 pt-32 pb-24">
        {/* Mock/Real status banner */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-2xl glass-strong border border-white/10 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${isMock ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
              <span className="text-sm font-bold uppercase tracking-wider">
                {isMock ? "Mock Mode Active" : "Production Database Connected"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isMock
                ? "Simulating Firebase backend using localStorage. Changes do not save to cloud."
                : "Real-time updates sync instantly with Firestore & Cloud Storage."}
            </p>
          </div>
          {isMock && (
            <button
              onClick={() => {
                setMockBypass(false);
                toast.info("Admin bypass deactivated.");
              }}
              className="text-xs font-semibold text-muted-foreground hover:text-white border border-white/10 rounded-lg px-3 py-1.5 hover:bg-white/5 transition-all"
            >
              Re-lock Gate
            </button>
          )}
        </div>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between mb-8">
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Console</div>
            <h1 className="mt-2 font-display text-4xl font-black">Admin Control Panel</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("products")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                activeTab === "products"
                  ? "bg-white text-black border-white"
                  : "bg-white/5 text-muted-foreground border-white/10 hover:text-white"
              }`}
            >
              <Package className="h-4 w-4" /> Products
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                activeTab === "orders"
                  ? "bg-white text-black border-white"
                  : "bg-white/5 text-muted-foreground border-white/10 hover:text-white"
              }`}
            >
              <Layers className="h-4 w-4" /> Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                activeTab === "reviews"
                  ? "bg-white text-black border-white"
                  : "bg-white/5 text-muted-foreground border-white/10 hover:text-white"
              }`}
            >
              <Star className="h-4 w-4" /> Reviews ({reviews.length})
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                activeTab === "settings"
                  ? "bg-white text-black border-white"
                  : "bg-white/5 text-muted-foreground border-white/10 hover:text-white"
              }`}
            >
              <Settings className="h-4 w-4" /> Site Settings
            </button>
          </div>
        </div>

        {/* --- PRODUCTS TAB --- */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Layers className="h-5 w-5 text-muted-foreground" />
                Product Directory ({products.length})
              </h2>
              <button
                onClick={handleOpenAddDialog}
                className="flex items-center gap-1.5 bg-[image:var(--gradient-primary)] hover:opacity-90 text-white rounded-xl px-4 py-2.5 text-xs font-bold transition-all"
              >
                <Plus className="h-4 w-4" /> Add Sneaker
              </button>
            </div>

            <div className="rounded-2xl glass border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <th className="p-4 pl-6">Product</th>
                      <th className="p-4">Brand</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Rating</th>
                      <th className="p-4">Badge</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 pl-6 flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="h-10 w-10 rounded-lg object-cover bg-white/5 border border-white/10"
                          />
                          <span className="font-bold line-clamp-1">{p.name}</span>
                        </td>
                        <td className="p-4 text-muted-foreground font-semibold">{p.brand}</td>
                        <td className="p-4">
                          <span className="font-bold">₹{p.price}</span>
                          {p.oldPrice && (
                            <span className="text-xs text-muted-foreground line-through ml-1.5">
                              ₹{p.oldPrice}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-muted-foreground font-medium">{p.rating} / 5.0</td>
                        <td className="p-4">
                          {p.badge && (
                            <span className="rounded-full bg-white/10 border border-white/10 px-2.5 py-0.5 text-[9px] font-bold uppercase text-white">
                              {p.badge}
                            </span>
                          )}
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <div className="inline-flex gap-1.5">
                            <button
                              onClick={() => handleOpenEditDialog(p)}
                              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-muted-foreground hover:text-white"
                              title="Edit product"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                              title="Delete product"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center p-8 text-muted-foreground">
                          No products found. Add your first sneaker drop!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- SETTINGS TAB --- */}
        {activeTab === "settings" && (
          <div className="max-w-2xl">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
              <Settings className="h-5 w-5 text-muted-foreground" />
              Global Configuration
            </h2>

            <form onSubmit={handleSettingsSubmit} className="rounded-2xl glass border border-white/10 p-6 space-y-5">


              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Promo Hero Subtitle
                </label>
                <textarea
                  value={promoBanner}
                  onChange={(e) => setPromoBanner(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm outline-none focus:border-white/20 transition-colors resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Promo Code (e.g. TEENS20)
                  </label>
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm outline-none focus:border-white/20 transition-colors"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Discount Percent (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm outline-none focus:border-white/20 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Primary WhatsApp Booking Number
                  </label>
                  <input
                    type="text"
                    placeholder="+919876543210"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm outline-none focus:border-white/20 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Secondary WhatsApp Booking Number (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="+919876543210"
                    value={whatsappNumber2}
                    onChange={(e) => setWhatsappNumber2(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm outline-none focus:border-white/20 transition-colors"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Brands Stat (e.g. 20+)
                  </label>
                  <input
                    type="text"
                    value={statBrands}
                    onChange={(e) => setStatBrands(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm outline-none focus:border-white/20 transition-colors"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Pairs Stat (e.g. 10K+)
                  </label>
                  <input
                    type="text"
                    value={statPairs}
                    onChange={(e) => setStatPairs(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm outline-none focus:border-white/20 transition-colors"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Rating Stat (e.g. 4.9★)
                  </label>
                  <input
                    type="text"
                    value={statRating}
                    onChange={(e) => setStatRating(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm outline-none focus:border-white/20 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <span className="text-sm font-semibold">Online Store Access</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    If toggled off, guest checkout is disabled.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStoreOpen((prev) => !prev)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    storeOpen ? "bg-[oklch(0.62_0.21_285)]" : "bg-white/10"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      storeOpen ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <button
                type="submit"
                disabled={settingsLoading}
                className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-white text-black hover:bg-white/90 disabled:bg-white/50 px-4 py-3 text-sm font-bold tracking-wide transition-all"
              >
                {settingsLoading ? "Saving..." : "Save Settings"}
              </button>
            </form>
          </div>
        )}

        {/* --- ORDERS TAB --- */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Layers className="h-5 w-5 text-muted-foreground" />
              Customer Orders ({orders.length})
            </h2>

            <div className="rounded-2xl glass border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <th className="p-4 pl-6">Order ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Items</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Payment</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 pl-6 font-bold text-muted-foreground">
                          #{o.id.slice(-6)}
                        </td>
                        <td className="p-4">
                          <div className="font-bold">{o.userName}</div>
                          <div className="text-xs text-muted-foreground">{o.userEmail}</div>
                        </td>
                        <td className="p-4">
                          <div className="max-w-[200px] truncate" title={o.items.map(it => `${it.brand} ${it.name} (x${it.quantity})`).join(', ')}>
                            {o.items.map(it => `${it.brand} ${it.name} (x${it.quantity})`).join(', ')}
                          </div>
                        </td>
                        <td className="p-4 font-bold">₹{o.total}</td>
                        <td className="p-4 text-xs text-muted-foreground font-semibold">
                          {o.paymentMethod}
                        </td>
                        <td className="p-4">
                          <select
                            value={o.status}
                            onChange={(e) => updateOrderStatus(o.id, e.target.value as any)}
                            className={cn(
                              "rounded-lg px-2 py-1 text-xs font-bold outline-none border cursor-pointer bg-black/40",
                              o.status === "Pending" && "border-yellow-500/20 text-yellow-400",
                              o.status === "Processing" && "border-blue-500/20 text-blue-400",
                              o.status === "Shipped" && "border-indigo-500/20 text-indigo-400",
                              o.status === "Delivered" && "border-emerald-500/20 text-emerald-400",
                              o.status === "Cancelled" && "border-red-500/20 text-red-400"
                            )}
                          >
                            <option value="Pending" className="bg-[#1a1a24] text-yellow-400">Pending</option>
                            <option value="Processing" className="bg-[#1a1a24] text-blue-400">Processing</option>
                            <option value="Shipped" className="bg-[#1a1a24] text-indigo-400">Shipped</option>
                            <option value="Delivered" className="bg-[#1a1a24] text-emerald-400">Delivered</option>
                            <option value="Cancelled" className="bg-[#1a1a24] text-red-400">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <button
                            onClick={() => {
                              if (window.confirm("Delete this order record?")) {
                                deleteOrder(o.id);
                              }
                            }}
                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center p-8 text-muted-foreground">
                          No customer orders placed yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- REVIEWS TAB --- */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Star className="h-5 w-5 text-muted-foreground fill-muted-foreground" />
              Customer Feedbacks ({reviews.length})
            </h2>

            <div className="rounded-2xl glass border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <th className="p-4 pl-6">Product</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Rating</th>
                      <th className="p-4">Comment</th>
                      <th className="p-4">Date</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {reviews.map((r) => {
                      const prod = products.find((p) => p.id === r.productId);
                      return (
                        <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 pl-6 flex items-center gap-3">
                            <img
                              src={prod?.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff"}
                              alt={prod?.name || "Product"}
                              className="h-8 w-8 rounded object-cover"
                            />
                            <span className="font-bold line-clamp-1 max-w-[150px]">
                              {prod?.name || "Deleted Product"}
                            </span>
                          </td>
                          <td className="p-4 font-semibold">{r.userName}</td>
                          <td className="p-4 text-[oklch(0.78_0.16_220)] font-bold flex items-center gap-0.5">
                            {[...Array(r.rating)].map((_, i) => (
                              <Star key={i} className="h-3.5 w-3.5 fill-current" />
                            ))}
                          </td>
                          <td className="p-4 text-muted-foreground max-w-xs truncate" title={r.comment}>
                            {r.comment}
                          </td>
                          <td className="p-4 text-xs text-muted-foreground">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <button
                              onClick={() => {
                                if (window.confirm("Moderator action: delete this review?")) {
                                  deleteReview(r.id);
                                }
                              }}
                              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {reviews.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center p-8 text-muted-foreground">
                          No customer reviews submitted yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- ADD/EDIT PRODUCT DIALOG DIALOG --- */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl glass-strong border border-white/15 p-6 sm:p-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <h3 className="font-display text-2xl font-black mb-6">
              {editingProduct ? "Edit Sneaker Drop" : "New Sneaker Drop"}
            </h3>

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Brand *
                  </label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-white/20 transition-colors text-white"
                  >
                    <option value="Nike" className="bg-[#1a1a24] text-white">Nike</option>
                    <option value="Jordan" className="bg-[#1a1a24] text-white">Jordan</option>
                    <option value="Adidas" className="bg-[#1a1a24] text-white">Adidas</option>
                    <option value="Puma" className="bg-[#1a1a24] text-white">Puma</option>
                    <option value="New Balance" className="bg-[#1a1a24] text-white">New Balance</option>
                    <option value="Converse" className="bg-[#1a1a24] text-white">Converse</option>
                    <option value="Custom" className="bg-[#1a1a24] text-[oklch(0.62_0.21_285)] font-bold">+ Add custom brand...</option>
                  </select>

                  {brand === "Custom" && (
                    <div className="mt-2 space-y-1 animate-in slide-in-from-top-1 duration-150">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Custom Brand Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter brand name"
                        value={customBrand}
                        onChange={(e) => setCustomBrand(e.target.value)}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm outline-none focus:border-white/20 transition-colors text-white"
                        required
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Badge
                  </label>
                  <input
                    type="text"
                    placeholder="New / Hot / Limited"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm outline-none focus:border-white/20 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Product Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Air Force 1 Retro"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm outline-none focus:border-white/20 transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    placeholder="180"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm outline-none focus:border-white/20 transition-colors"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Old Price (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="220"
                    value={oldPrice}
                    onChange={(e) => setOldPrice(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm outline-none focus:border-white/20 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Rating (1.0-5.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm outline-none focus:border-white/20 transition-colors"
                  />
                </div>
              </div>

              {/* Image upload section */}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Product Image *
                </label>
                <div className="mt-1 flex items-center gap-4">
                  <div className="relative h-20 w-20 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <FileImage className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <label className="flex flex-col flex-grow items-center justify-center h-20 rounded-xl bg-white/5 hover:bg-white/10 border border-dashed border-white/20 cursor-pointer transition-colors px-4">
                    <span className="text-xs font-bold text-foreground">Click to upload file</span>
                    <span className="text-[10px] text-muted-foreground mt-1">PNG, JPG or WEBP</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={dialogLoading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white text-black hover:bg-white/90 disabled:bg-white/50 px-4 py-2.5 text-sm font-bold transition-colors"
                >
                  {dialogLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {dialogLoading ? "Uploading..." : editingProduct ? "Update drop" : "Add drop"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
