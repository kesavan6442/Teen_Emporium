import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getDbStatus,
  signupUserServer,
  loginUserServer,
  getUserProfileServer,
  updateUserWishlistServer,
} from "../lib/dbServerFunctions";
import { toast } from "sonner";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: "admin" | "user";
  wishlist: string[];
  createdAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isMock: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  signup: (name: string, email: string, password: string) => Promise<UserProfile>;
  loginWithGoogle: () => Promise<UserProfile>;
  logout: () => Promise<void>;
  updateUserWishlist: (wishlist: string[]) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USERS_KEY = "teens_emporium_mock_users";
const MOCK_CURRENT_USER_KEY = "teens_emporium_current_user";

// Seed initial mock admin and user if not present
const initializeMockUsers = () => {
  if (typeof window === "undefined") return [];
  const existing = localStorage.getItem(MOCK_USERS_KEY);
  if (!existing) {
    const initialUsers = [
      {
        uid: "mock-admin-id",
        name: "Admin User",
        email: "admin@teensemporium.com",
        password: "adminpassword",
        role: "admin" as const,
        wishlist: [],
        createdAt: new Date().toISOString(),
      },
      {
        uid: "mock-user-id",
        name: "Jane Doe",
        email: "jane@example.com",
        password: "password123",
        role: "user" as const,
        wishlist: ["1", "3"],
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(initialUsers));
    return initialUsers;
  }
  return JSON.parse(existing);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(true);

  // Initialize and check database status
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { isMockEnabled: mockDb } = await getDbStatus();
        setIsMock(mockDb);

        if (mockDb) {
          initializeMockUsers();
          const cached = localStorage.getItem(MOCK_CURRENT_USER_KEY);
          if (cached) {
            setUser(JSON.parse(cached));
          }
        } else {
          // MongoDB Mode: sync cache with database profile if logged in
          const cachedUser = localStorage.getItem(MOCK_CURRENT_USER_KEY);
          if (cachedUser) {
            try {
              const profile = JSON.parse(cachedUser);
              const freshProfile = await getUserProfileServer({ data: profile.uid });
              if (freshProfile) {
                const mappedProfile = {
                  uid: freshProfile.uid,
                  name: freshProfile.name,
                  email: freshProfile.email,
                  role: freshProfile.role as "admin" | "user",
                  wishlist: freshProfile.wishlist || [],
                  createdAt: freshProfile.createdAt,
                };
                setUser(mappedProfile);
                localStorage.setItem(MOCK_CURRENT_USER_KEY, JSON.stringify(mappedProfile));
              } else {
                setUser(null);
                localStorage.removeItem(MOCK_CURRENT_USER_KEY);
              }
            } catch (err) {
              console.warn("MongoDB auth profile sync failed, falling back to cache:", err);
              const profile = JSON.parse(cachedUser);
              setUser(profile);
            }
          }
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        setIsMock(true);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    if (isMock) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const users = initializeMockUsers();
          const match = users.find((u: any) => u.email === email && u.password === password);
          if (match) {
            const profile: UserProfile = {
              uid: match.uid,
              name: match.name,
              email: match.email,
              role: match.role,
              wishlist: match.wishlist || [],
              createdAt: match.createdAt,
            };
            localStorage.setItem(MOCK_CURRENT_USER_KEY, JSON.stringify(profile));
            setUser(profile);
            resolve(profile);
          } else {
            reject(new Error("Invalid email or password."));
          }
        }, 800);
      });
    }

    try {
      const freshProfile = await loginUserServer({ data: { email, password } });
      if (!freshProfile) {
        throw new Error("Invalid email or password.");
      }
      const profile: UserProfile = {
        uid: freshProfile.uid,
        name: freshProfile.name,
        email: freshProfile.email,
        role: freshProfile.role as "admin" | "user",
        wishlist: freshProfile.wishlist || [],
        createdAt: freshProfile.createdAt,
      };
      localStorage.setItem(MOCK_CURRENT_USER_KEY, JSON.stringify(profile));
      setUser(profile);
      return profile;
    } catch (error: any) {
      throw new Error(error.message || "Invalid email or password.");
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<UserProfile> => {
    if (isMock) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const users = initializeMockUsers();
          if (users.some((u: any) => u.email === email)) {
            reject(new Error("Email already registered."));
            return;
          }
          const isFirstAdmin = email.includes("admin");
          const newUser = {
            uid: `mock-user-${Date.now()}`,
            name,
            email,
            password,
            role: isFirstAdmin ? ("admin" as const) : ("user" as const),
            wishlist: [],
            createdAt: new Date().toISOString(),
          };
          users.push(newUser);
          localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));

          const profile: UserProfile = {
            uid: newUser.uid,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            wishlist: newUser.wishlist,
            createdAt: newUser.createdAt,
          };
          localStorage.setItem(MOCK_CURRENT_USER_KEY, JSON.stringify(profile));
          setUser(profile);
          resolve(profile);
        }, 800);
      });
    }

    try {
      const freshProfile = await signupUserServer({ data: { name, email, password } });
      if (!freshProfile) {
        throw new Error("Signup failed.");
      }
      const profile: UserProfile = {
        uid: freshProfile.uid,
        name: freshProfile.name,
        email: freshProfile.email,
        role: freshProfile.role as "admin" | "user",
        wishlist: freshProfile.wishlist || [],
        createdAt: freshProfile.createdAt,
      };
      localStorage.setItem(MOCK_CURRENT_USER_KEY, JSON.stringify(profile));
      setUser(profile);
      return profile;
    } catch (error: any) {
      throw new Error(error.message || "Signup failed.");
    }
  };

  const loginWithGoogle = async (): Promise<UserProfile> => {
    if (isMock) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const profile: UserProfile = {
            uid: "mock-google-user-id",
            name: "Google Explorer",
            email: "google@teensemporium.com",
            role: "user",
            wishlist: [],
            createdAt: new Date().toISOString(),
          };
          localStorage.setItem(MOCK_CURRENT_USER_KEY, JSON.stringify(profile));
          setUser(profile);
          resolve(profile);
        }, 800);
      });
    }

    try {
      const googleUserPayload = {
        name: "Google Explorer",
        email: "google@teensemporium.com",
        password: "google-auth-simulated-password"
      };
      let freshProfile;
      try {
        freshProfile = await loginUserServer({ data: { email: googleUserPayload.email, password: googleUserPayload.password } });
      } catch (err) {
        freshProfile = await signupUserServer({ data: googleUserPayload });
      }
      if (!freshProfile) {
        throw new Error("Google login failed.");
      }
      const profile: UserProfile = {
        uid: freshProfile.uid,
        name: freshProfile.name,
        email: freshProfile.email,
        role: freshProfile.role as "admin" | "user",
        wishlist: freshProfile.wishlist || [],
        createdAt: freshProfile.createdAt,
      };
      localStorage.setItem(MOCK_CURRENT_USER_KEY, JSON.stringify(profile));
      setUser(profile);
      return profile;
    } catch (error: any) {
      console.error(error);
      throw new Error("Google login failed.");
    }
  };

  const logout = async (): Promise<void> => {
    localStorage.removeItem(MOCK_CURRENT_USER_KEY);
    setUser(null);
  };

  const updateUserWishlist = async (newWishlist: string[]): Promise<void> => {
    if (!user) return;

    const updatedProfile = { ...user, wishlist: newWishlist };
    localStorage.setItem(MOCK_CURRENT_USER_KEY, JSON.stringify(updatedProfile));
    setUser(updatedProfile);

    if (isMock) {
      const users = initializeMockUsers();
      const index = users.findIndex((u: any) => u.uid === user.uid);
      if (index !== -1) {
        users[index].wishlist = newWishlist;
        localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
      }
      return;
    }

    try {
      await updateUserWishlistServer({ data: { uid: user.uid, wishlist: newWishlist } });
    } catch (error) {
      console.error("Error saving user wishlist to MongoDB:", error);
      toast.error("Failed to sync wishlist with database.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isMock,
        login,
        signup,
        loginWithGoogle,
        logout,
        updateUserWishlist,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
