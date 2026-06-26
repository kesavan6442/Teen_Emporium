import { createServerFn } from "@tanstack/react-start";
import { connectToDatabase } from "./mongodb";
import { ObjectId } from "mongodb";

// --- Seed Data & Types ---
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

const SEED_PRODUCTS = [
  { id: "1", brand: "Nike", name: "Air Court Premium", price: 189, oldPrice: 229, rating: 4.8, image: "/src/assets/sneaker-1.jpg", badge: "New" },
  { id: "2", brand: "Jordan", name: "Flight 23 Retro", price: 249, rating: 4.9, image: "/src/assets/sneaker-2.jpg", badge: "Hot" },
  { id: "3", brand: "Adidas", name: "Pulse Runner V2", price: 159, oldPrice: 199, rating: 4.7, image: "/src/assets/sneaker-3.jpg" },
  { id: "4", brand: "Puma", name: "Suede Classic Tan", price: 129, rating: 4.6, image: "/src/assets/sneaker-4.jpg" },
  { id: "5", brand: "New Balance", name: "990v6 Cream", price: 219, rating: 4.9, image: "/src/assets/sneaker-1.jpg", badge: "Limited" },
  { id: "6", brand: "Jordan", name: "AJ1 Bred Mid", price: 199, oldPrice: 239, rating: 4.8, image: "/src/assets/sneaker-2.jpg" },
  { id: "7", brand: "Adidas", name: "Volt Streak", price: 149, rating: 4.5, image: "/src/assets/sneaker-3.jpg" },
  { id: "8", brand: "Puma", name: "Court Sand", price: 109, oldPrice: 139, rating: 4.4, image: "/src/assets/sneaker-4.jpg" },
];

const DEFAULT_SETTINGS = {
  announcement: "",
  promoBanner: "Elevated comfort. Rare drops. Authentic streetwear.",
  storeOpen: true,
  discountCode: "TEENS20",
  discountPercent: 20,
  whatsappNumber: "+919876543210",
  statBrands: "20+",
  statPairs: "10K+",
  statRating: "4.9★",
};

// --- Helper Functions ---
const mapId = (doc: any) => {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { id: _id.toString(), ...rest };
};

const mapUser = (doc: any) => {
  if (!doc) return null;
  return {
    uid: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    role: doc.role,
    wishlist: doc.wishlist || [],
    cart: doc.cart || [],
    createdAt: doc.createdAt
  };
};

const getFilterById = (id: string) => {
  return id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)
    ? { _id: new ObjectId(id) }
    : { _id: id as any };
};

// --- Server Functions ---

// 1. Connection check / DB status
export const getDbStatus = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      await connectToDatabase();
      return { isMockEnabled: false };
    } catch (error) {
      console.warn("MongoDB connection failed, falling back to mock mode:", error);
      return { isMockEnabled: true };
    }
  });

// 2. Products CRUD
export const getProductsServer = createServerFn({ method: "GET" })
  .handler(async () => {
    const { db } = await connectToDatabase();
    const products = await db.collection("products").find({}).toArray();
    if (products.length === 0) {
      const docsToInsert = SEED_PRODUCTS.map(({ id, ...p }) => ({
        _id: id as any,
        ...p
      }));
      await db.collection("products").insertMany(docsToInsert);
      const seeded = await db.collection("products").find({}).toArray();
      return seeded.map(mapId);
    }
    return products.map(mapId);
  });

export const addProductServer = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    const { db } = await connectToDatabase();
    const result = await db.collection("products").insertOne(data);
    return { id: result.insertedId.toString() };
  });

export const updateProductServer = createServerFn({ method: "POST" })
  .validator((d: { id: string; updates: any }) => d)
  .handler(async ({ data }) => {
    const { db } = await connectToDatabase();
    const { id, updates } = data;
    await db.collection("products").updateOne(getFilterById(id), { $set: updates });
    return { success: true };
  });

export const deleteProductServer = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const { db } = await connectToDatabase();
    await db.collection("products").deleteOne(getFilterById(id));
    return { success: true };
  });

// 3. Reviews CRUD
export const getReviewsServer = createServerFn({ method: "GET" })
  .handler(async () => {
    const { db } = await connectToDatabase();
    const reviews = await db.collection("reviews").find({}).toArray();
    return reviews.map(mapId);
  });

export const addReviewServer = createServerFn({ method: "POST" })
  .validator((review: any) => review)
  .handler(async ({ data: review }) => {
    const { db } = await connectToDatabase();
    const result = await db.collection("reviews").insertOne(review);
    return { id: result.insertedId.toString() };
  });

export const deleteReviewServer = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const { db } = await connectToDatabase();
    await db.collection("reviews").deleteOne(getFilterById(id));
    return { success: true };
  });

// 4. Settings
export const getSettingsServer = createServerFn({ method: "GET" })
  .handler(async () => {
    const { db } = await connectToDatabase();
    let settings = await db.collection("settings").findOne({ _id: "site" as any });
    if (!settings) {
      await db.collection("settings").insertOne({ _id: "site" as any, ...DEFAULT_SETTINGS });
      settings = await db.collection("settings").findOne({ _id: "site" as any });
    } else {
      let needsUpdate = false;
      const updates: any = {};
      if (settings.announcement && settings.announcement.includes("Free worldwide express shipping")) {
        updates.announcement = "";
        settings.announcement = "";
        needsUpdate = true;
      }
      if (settings.statBrands === undefined) {
        updates.statBrands = "20+";
        settings.statBrands = "20+";
        needsUpdate = true;
      }
      if (settings.statPairs === undefined) {
        updates.statPairs = "10K+";
        settings.statPairs = "10K+";
        needsUpdate = true;
      }
      if (settings.statRating === undefined) {
        updates.statRating = "4.9★";
        settings.statRating = "4.9★";
        needsUpdate = true;
      }
      if (needsUpdate) {
        await db.collection("settings").updateOne({ _id: "site" as any }, { $set: updates });
      }
    }
    const { _id, ...rest } = settings!;
    return rest;
  });

export const updateSettingsServer = createServerFn({ method: "POST" })
  .validator((settings: any) => settings)
  .handler(async ({ data: settings }) => {
    const { db } = await connectToDatabase();
    await db.collection("settings").updateOne(
      { _id: "site" as any },
      { $set: settings },
      { upsert: true }
    );
    return { success: true };
  });

// 5. Orders
export const getOrdersServer = createServerFn({ method: "POST" })
  .validator((user: { uid: string; role: string }) => user)
  .handler(async ({ data }) => {
    const { db } = await connectToDatabase();
    let orders;
    if (data.role === "admin") {
      orders = await db.collection("orders").find({}).toArray();
    } else {
      orders = await db.collection("orders").find({ userId: data.uid }).toArray();
    }
    return orders.map(mapId);
  });

export const placeOrderServer = createServerFn({ method: "POST" })
  .validator((order: any) => order)
  .handler(async ({ data: order }) => {
    const { db } = await connectToDatabase();
    const result = await db.collection("orders").insertOne(order);
    return { id: result.insertedId.toString() };
  });

export const updateOrderStatusServer = createServerFn({ method: "POST" })
  .validator((data: { id: string; status: string }) => data)
  .handler(async ({ data }) => {
    const { db } = await connectToDatabase();
    await db.collection("orders").updateOne(getFilterById(data.id), { $set: { status: data.status } });
    return { success: true };
  });

export const deleteOrderServer = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const { db } = await connectToDatabase();
    await db.collection("orders").deleteOne(getFilterById(id));
    return { success: true };
  });

// 6. User Auth & Profiles
export const getUserProfileServer = createServerFn({ method: "POST" })
  .validator((uid: string) => uid)
  .handler(async ({ data: uid }) => {
    const { db } = await connectToDatabase();
    const userDoc = await db.collection("users").findOne({ _id: uid as any });
    return mapUser(userDoc);
  });

export const signupUserServer = createServerFn({ method: "POST" })
  .validator((data: any) => data)
  .handler(async ({ data }) => {
    const { db } = await connectToDatabase();
    const existing = await db.collection("users").findOne({ email: data.email });
    if (existing) {
      throw new Error("Email already registered.");
    }
    const uid = `usr_${Date.now()}`;
    const isFirstAdmin = data.email.includes("admin") || data.email === "kesavan.mcse@gmail.com";
    const newUser = {
      _id: uid as any,
      name: data.name,
      email: data.email,
      password: data.password,
      role: isFirstAdmin ? "admin" : "user",
      wishlist: [],
      cart: [],
      createdAt: new Date().toISOString(),
    };
    await db.collection("users").insertOne(newUser);
    return mapUser(newUser);
  });

export const loginUserServer = createServerFn({ method: "POST" })
  .validator((data: any) => data)
  .handler(async ({ data }) => {
    const { db } = await connectToDatabase();
    const userDoc = await db.collection("users").findOne({ email: data.email });
    if (!userDoc || userDoc.password !== data.password) {
      throw new Error("Invalid email or password.");
    }
    return mapUser(userDoc);
  });

export const updateUserCartServer = createServerFn({ method: "POST" })
  .validator((data: { uid: string; cart: any[] }) => data)
  .handler(async ({ data }) => {
    const { db } = await connectToDatabase();
    await db.collection("users").updateOne(
      { _id: data.uid as any },
      { $set: { cart: data.cart } }
    );
    return { success: true };
  });

export const updateUserWishlistServer = createServerFn({ method: "POST" })
  .validator((data: { uid: string; wishlist: string[] }) => data)
  .handler(async ({ data }) => {
    const { db } = await connectToDatabase();
    await db.collection("users").updateOne(
      { _id: data.uid as any },
      { $set: { wishlist: data.wishlist } }
    );
    return { success: true };
  });
