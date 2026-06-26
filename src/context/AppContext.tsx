import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { Product } from "../components/site/ProductCard";

import {
  getProductsServer,
  addProductServer,
  updateProductServer,
  deleteProductServer,
  getReviewsServer,
  addReviewServer,
  deleteReviewServer,
  getSettingsServer,
  updateSettingsServer,
  getOrdersServer,
  placeOrderServer,
  updateOrderStatusServer,
  deleteOrderServer,
  getUserProfileServer,
  updateUserCartServer,
} from "../lib/dbServerFunctions";
import { toast } from "sonner";

export interface CartItem {
  id: string; // e.g. productId_size
  productId: string;
  quantity: number;
  size: string;
}

export interface CartItemExtended extends CartItem {
  product: Product | undefined;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface SiteSettings {
  announcement: string;
  promoBanner: string;
  storeOpen: boolean;
  discountCode: string;
  discountPercent: number;
  whatsappNumber: string;
  whatsappNumber2: string;
  statBrands: string;
  statPairs: string;
  statRating: string;
}

export interface ShippingDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

export interface OrderItem {
  productId: string;
  brand: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  shippingDetails: ShippingDetails;
  paymentMethod: string;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  createdAt: string;
}

interface AppContextType {
  products: Product[];
  cart: CartItemExtended[];
  wishlist: string[]; // List of product IDs
  reviews: Review[];
  orders: Order[];
  siteSettings: SiteSettings;
  loading: boolean;
  addToCart: (productId: string, quantity: number, size: string) => void;
  updateCartQty: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  addProduct: (product: Omit<Product, "id">, imageFile?: File) => Promise<void>;
  updateProduct: (productId: string, product: Partial<Product>, imageFile?: File) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  updateSiteSettings: (settings: Partial<SiteSettings>) => Promise<void>;
  addReview: (productId: string, rating: number, comment: string) => Promise<void>;
  uploadImage: (file: File) => Promise<string>;
  placeOrder: (shippingDetails: ShippingDetails, paymentMethod: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order["status"]) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_SETTINGS: SiteSettings = {
  announcement: "",
  promoBanner: "Elevated comfort. Rare drops. Authentic streetwear.",
  storeOpen: true,
  discountCode: "TEENS20",
  discountPercent: 20,
  whatsappNumber: "+919876543210",
  whatsappNumber2: "",
  statBrands: "20+",
  statPairs: "10K+",
  statRating: "4.9★",
};

const LOCAL_PRODUCTS_KEY = "teens_emporium_local_products";
const GUEST_CART_KEY = "teens_emporium_guest_cart";
const GUEST_WISHLIST_KEY = "teens_emporium_guest_wishlist";
const MOCK_REVIEWS_KEY = "teens_emporium_mock_reviews";
const MOCK_SETTINGS_KEY = "teens_emporium_mock_settings";
const MOCK_ORDERS_KEY = "teens_emporium_mock_orders";

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateUserWishlist, isMock } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [rawCart, setRawCart] = useState<CartItem[]>([]);
  const [guestWishlist, setGuestWishlist] = useState<string[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Expose the consolidated wishlist (user or guest)
  const wishlist = user ? user.wishlist : guestWishlist;

  // Expose the cart with full product info resolved
  const cart: CartItemExtended[] = rawCart.map((item) => ({
    ...item,
    product: products.find((p) => p.id === item.productId),
  }));

  // 1. Initial Load of Products, Reviews, Settings
  useEffect(() => {
    const loadAppData = async () => {
      setLoading(true);
      try {
        if (isMock) {
          // --- Mock mode loading ---
          const savedProducts = localStorage.getItem(LOCAL_PRODUCTS_KEY);
          if (savedProducts) {
            setProducts(JSON.parse(savedProducts));
          } else {
            localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify([]));
            setProducts([]);
          }

          const savedReviews = localStorage.getItem(MOCK_REVIEWS_KEY);
          if (savedReviews) {
            setReviews(JSON.parse(savedReviews));
          } else {
            const initialReviews: Review[] = [
              {
                id: "r1",
                productId: "1",
                userId: "mock-user-id",
                userName: "Jane Doe",
                rating: 5,
                comment: "Perfect fit, absolutely love the premium leather quality!",
                createdAt: new Date().toISOString(),
              },
            ];
            localStorage.setItem(MOCK_REVIEWS_KEY, JSON.stringify(initialReviews));
            setReviews(initialReviews);
          }

          const savedSettings = localStorage.getItem(MOCK_SETTINGS_KEY);
          if (savedSettings) {
            setSiteSettings(JSON.parse(savedSettings));
          } else {
            localStorage.setItem(MOCK_SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
            setSiteSettings(DEFAULT_SETTINGS);
          }
        } else {
          // --- Real MongoDB mode loading ---
          try {
            const loadedProducts = await getProductsServer();
            setProducts(loadedProducts);

            const loadedReviews = await getReviewsServer();
            setReviews(loadedReviews);

            const loadedSettings = await getSettingsServer();
            setSiteSettings(loadedSettings);
          } catch (dbErr) {
            console.error("Failed to load MongoDB data, using local mock data:", dbErr);
          }
        }
      } catch (err) {
        console.error("Error loading app data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAppData();
  }, [isMock]);

  // 1b. Load Orders (depends on user auth state)
  useEffect(() => {
    const loadOrders = async () => {
      if (isMock) {
        const savedOrders = localStorage.getItem(MOCK_ORDERS_KEY);
        if (savedOrders) {
          setOrders(JSON.parse(savedOrders));
        } else {
          setOrders([]);
        }
        return;
      }

      if (!user) {
        setOrders([]);
        return;
      }

      try {
        const loadedOrders = await getOrdersServer({ data: { uid: user.uid, role: user.role } });
        setOrders(loadedOrders as Order[]);
      } catch (error) {
        console.error("Error loading customer orders from MongoDB:", error);
      }
    };

    loadOrders();
  }, [user, isMock]);

  // 2. Load Cart and Guest Wishlist
  useEffect(() => {
    if (isMock || !user) {
      const cachedCart = localStorage.getItem(GUEST_CART_KEY);
      if (cachedCart) {
        setRawCart(JSON.parse(cachedCart));
      } else {
        setRawCart([]);
      }

      const cachedWishlist = localStorage.getItem(GUEST_WISHLIST_KEY);
      if (cachedWishlist) {
        setGuestWishlist(JSON.parse(cachedWishlist));
      } else {
        setGuestWishlist([]);
      }
    } else {
      const fetchUserCart = async () => {
        try {
          const profile = await getUserProfileServer({ data: user.uid });
          if (profile && profile.cart) {
            setRawCart(profile.cart);
          } else {
            setRawCart([]);
          }
        } catch (error) {
          console.error("Error fetching user cart from MongoDB:", error);
        }
      };
      fetchUserCart();
    }
  }, [user, isMock]);

  // Helper to persist cart state
  const saveCart = async (newCart: CartItem[]) => {
    setRawCart(newCart);

    if (isMock || !user) {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(newCart));
    } else {
      try {
        await updateUserCartServer({ data: { uid: user.uid, cart: newCart } });
      } catch (error) {
        console.error("Error saving user cart to MongoDB:", error);
      }
    }
  };

  // --- Cart operations ---
  const addToCart = (productId: string, quantity: number, size: string) => {
    const itemUniqueId = `${productId}_${size}`;
    const existingIndex = rawCart.findIndex((item) => item.id === itemUniqueId);
    let newCart = [...rawCart];

    if (existingIndex !== -1) {
      newCart[existingIndex].quantity += quantity;
    } else {
      newCart.push({
        id: itemUniqueId,
        productId,
        quantity,
        size,
      });
    }
    saveCart(newCart);
    toast.success("Added to cart!");
  };

  const updateCartQty = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    const newCart = rawCart.map((item) =>
      item.id === cartItemId ? { ...item, quantity } : item
    );
    saveCart(newCart);
  };

  const removeFromCart = (cartItemId: string) => {
    const newCart = rawCart.filter((item) => item.id !== cartItemId);
    saveCart(newCart);
    toast.info("Removed from cart");
  };

  const clearCart = () => {
    saveCart([]);
  };

  // --- Wishlist operations ---
  const toggleWishlist = async (productId: string) => {
    let newWishlist: string[];

    if (wishlist.includes(productId)) {
      newWishlist = wishlist.filter((id) => id !== productId);
      toast.info("Removed from wishlist");
    } else {
      newWishlist = [...wishlist, productId];
      toast.success("Added to wishlist!");
    }

    if (user) {
      try {
        await updateUserWishlist(newWishlist);
      } catch (error) {
        console.error("Error updating database wishlist:", error);
        toast.error("Failed to save wishlist.");
      }
    } else {
      setGuestWishlist(newWishlist);
      localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(newWishlist));
    }
  };

  // --- Image Upload helper ---
  const uploadImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = (err) => {
        reject(err);
      };
      reader.readAsDataURL(file);
    });
  };

  // --- Product CRUD ---
  const addProduct = async (productData: Omit<Product, "id">, imageFile?: File) => {
    let imageUrl = productData.image;

    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }

    const finalProduct = {
      ...productData,
      image: imageUrl,
      price: Number(productData.price),
      oldPrice: productData.oldPrice ? Number(productData.oldPrice) : undefined,
      rating: productData.rating ? Number(productData.rating) : 5.0,
    };

    if (isMock) {
      const newProduct: Product = {
        id: `mock-prod-${Date.now()}`,
        ...finalProduct,
      };
      const updatedProducts = [newProduct, ...products];
      setProducts(updatedProducts);
      localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(updatedProducts));
      toast.success("Product added successfully (Mock Mode).");
      return;
    }

    try {
      const res = await addProductServer({ data: finalProduct });
      setProducts((prev) => [{ id: res.id, ...finalProduct }, ...prev]);
      toast.success("Product added successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add product.");
    }
  };

  const updateProduct = async (productId: string, productData: Partial<Product>, imageFile?: File) => {
    let imageUrl = productData.image;

    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }

    const updates: Partial<Product> = {
      ...productData,
    };
    if (imageUrl) updates.image = imageUrl;
    if (productData.price !== undefined) updates.price = Number(productData.price);
    if (productData.oldPrice !== undefined) updates.oldPrice = productData.oldPrice ? Number(productData.oldPrice) : undefined;
    if (productData.rating !== undefined) updates.rating = Number(productData.rating);

    if (isMock) {
      const updatedProducts = products.map((p) =>
        p.id === productId ? { ...p, ...updates } : p
      );
      setProducts(updatedProducts);
      localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(updatedProducts));
      toast.success("Product updated successfully (Mock Mode).");
      return;
    }

    try {
      await updateProductServer({ data: { id: productId, updates } });
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, ...updates } : p))
      );
      toast.success("Product updated successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update product.");
    }
  };

  const deleteProduct = async (productId: string) => {
    if (isMock) {
      const updatedProducts = products.filter((p) => p.id !== productId);
      setProducts(updatedProducts);
      localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(updatedProducts));
      toast.success("Product deleted successfully (Mock Mode).");
      return;
    }

    try {
      await deleteProductServer({ data: productId });
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast.success("Product deleted successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete product.");
    }
  };

  // --- Site Settings Update ---
  const updateSiteSettings = async (settingsData: Partial<SiteSettings>) => {
    const updated = { ...siteSettings, ...settingsData };

    if (isMock) {
      setSiteSettings(updated);
      localStorage.setItem(MOCK_SETTINGS_KEY, JSON.stringify(updated));
      toast.success("Settings updated successfully (Mock Mode).");
      return;
    }

    try {
      await updateSettingsServer({ data: updated });
      setSiteSettings(updated);
      toast.success("Settings updated successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update settings.");
    }
  };

  // --- Product Reviews ---
  const addReview = async (productId: string, rating: number, comment: string) => {
    const reviewerName = user ? user.name : "Anonymous Guest";
    const reviewerId = user ? user.uid : "guest-user-id";

    const newReviewData = {
      productId,
      userId: reviewerId,
      userName: reviewerName,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };

    if (isMock) {
      const newReview: Review = {
        id: `mock-review-${Date.now()}`,
        ...newReviewData,
      };
      const updatedReviews = [newReview, ...reviews];
      setReviews(updatedReviews);
      localStorage.setItem(MOCK_REVIEWS_KEY, JSON.stringify(updatedReviews));
      toast.success("Review submitted (Mock Mode).");
      return;
    }

    try {
      const res = await addReviewServer({ data: newReviewData });
      setReviews((prev) => [{ id: res.id, ...newReviewData }, ...prev]);
      toast.success("Review submitted successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit review.");
    }
  };

  // --- Order Placement and Management ---
  const placeOrder = async (shippingDetails: ShippingDetails, paymentMethod: string) => {
    const finalPrice = cart.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);
    const discount = Math.round((finalPrice * siteSettings.discountPercent) / 100);
    const total = finalPrice - discount;

    const orderItems: OrderItem[] = cart.map((item) => ({
      productId: item.productId,
      brand: item.product?.brand || "",
      name: item.product?.name || "",
      price: item.product?.price || 0,
      quantity: item.quantity,
      size: item.size,
      image: item.product?.image || "",
    }));

    const newOrderData = {
      userId: user ? user.uid : "guest-user",
      userName: user ? user.name : shippingDetails.fullName,
      userEmail: user ? user.email : shippingDetails.email,
      items: orderItems,
      subtotal: finalPrice,
      discount,
      total,
      shippingDetails,
      paymentMethod,
      status: "Pending" as const,
      createdAt: new Date().toISOString(),
    };

    if (isMock) {
      const newOrder: Order = {
        id: `mock-order-${Date.now()}`,
        ...newOrderData,
      };
      const updatedOrders = [newOrder, ...orders];
      setOrders(updatedOrders);
      localStorage.setItem(MOCK_ORDERS_KEY, JSON.stringify(updatedOrders));
      clearCart();
      toast.success("Order placed successfully (Mock Mode)!");
      return;
    }

    try {
      const res = await placeOrderServer({ data: newOrderData });
      setOrders((prev) => [{ id: res.id, ...newOrderData }, ...prev]);
      clearCart();
      toast.success("Order placed successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to place order.");
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order["status"]) => {
    if (isMock) {
      const updatedOrders = orders.map((o) =>
        o.id === orderId ? { ...o, status } : o
      );
      setOrders(updatedOrders);
      localStorage.setItem(MOCK_ORDERS_KEY, JSON.stringify(updatedOrders));
      toast.success("Order status updated (Mock Mode).");
      return;
    }

    try {
      await updateOrderStatusServer({ data: { id: orderId, status } });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
      toast.success("Order status updated.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update order status.");
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (isMock) {
      const updatedOrders = orders.filter((o) => o.id !== orderId);
      setOrders(updatedOrders);
      localStorage.setItem(MOCK_ORDERS_KEY, JSON.stringify(updatedOrders));
      toast.success("Order deleted (Mock Mode).");
      return;
    }

    try {
      await deleteOrderServer({ data: orderId });
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      toast.success("Order deleted successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete order.");
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (isMock) {
      const updatedReviews = reviews.filter((r) => r.id !== reviewId);
      setReviews(updatedReviews);
      localStorage.setItem(MOCK_REVIEWS_KEY, JSON.stringify(updatedReviews));
      toast.success("Review deleted (Mock Mode).");
      return;
    }

    try {
      await deleteReviewServer({ data: reviewId });
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      toast.success("Review deleted successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete review.");
    }
  };

  return (
    <AppContext.Provider
      value={{
        products,
        cart,
        wishlist,
        reviews,
        orders,
        siteSettings,
        loading,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        toggleWishlist,
        addProduct,
        updateProduct,
        deleteProduct,
        updateSiteSettings,
        addReview,
        uploadImage,
        placeOrder,
        updateOrderStatus,
        deleteOrder,
        deleteReview,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
