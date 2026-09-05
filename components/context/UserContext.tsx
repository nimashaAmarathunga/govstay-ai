"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = "PUBLIC_USER" | "GOV_EMPLOYEE" | "DEPT_ADMIN" | "SUPER_ADMIN";
export type WorkStatus = "WORKING" | "RETIRED";

export interface AppUser {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  empId: string | null;
  status: WorkStatus;
  placeOfWork: string | null;
  position: string | null;
  empIdPhoto?: string | null;
  nicNumber?: string | null;
  mobileNumber?: string | null;
  emailAddress?: string | null;
  residentialAddress?: string | null;
  preferredDistrict?: string | null;
  createdAt: string;
}

interface UserContextType {
  /** All users fetched from /api/users */
  users: AppUser[];
  /** The currently "active" user */
  activeUser: AppUser | null;
  /** Switch or set the active user */
  setActiveUser: (user: AppUser | null) => void;
  /** Re-fetch the user list (call after creating a new user) */
  refreshUsers: () => Promise<void>;
  /** Check current JWT authentication state */
  checkAuthSession: () => Promise<AppUser | null>;
  /** Logout user or admin session */
  logout: () => Promise<void>;
  isLoading: boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = "govsewana_active_user_id";

// ─── Provider ─────────────────────────────────────────────────────────────────

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [activeUser, setActiveUserState] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to load users");
      const data: AppUser[] = await res.json();
      setUsers(data);
      return data;
    } catch (err) {
      console.error("UserContext: could not fetch users", err);
      return [] as AppUser[];
    }
  }, []);

  const checkAuthSession = useCallback(async (): Promise<AppUser | null> => {
    try {
      // 1. Try checking User JWT session
      const userRes = await fetch("/api/auth/me");
      if (userRes.ok) {
        const data = await userRes.json();
        if (data.authenticated && data.user) {
          setActiveUserState(data.user);
          try {
            localStorage.setItem(STORAGE_KEY, data.user.id);
          } catch {}
          return data.user;
        }
      }

      // 2. Try checking Admin JWT session
      const adminRes = await fetch("/api/admin/me");
      if (adminRes.ok) {
        const data = await adminRes.json();
        if (data.authenticated && data.user) {
          setActiveUserState(data.user);
          try {
            localStorage.setItem(STORAGE_KEY, data.user.id);
          } catch {}
          return data.user;
        }
      }
    } catch (err) {
      console.error("UserContext: checkAuthSession error", err);
    }
    return null;
  }, []);

  // On mount: fetch users and restore or verify session
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.all([fetchUsers(), checkAuthSession()]).then(([allUsers, authenticatedUser]) => {
      if (!isMounted) return;

      if (!authenticatedUser) {
        try {
          // If the backend session is missing but local storage has a key, clear the key
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // localStorage unavailable
        }
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [fetchUsers, checkAuthSession]);

  const setActiveUser = (user: AppUser | null) => {
    setActiveUserState(user);
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, user.id);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // localStorage unavailable
    }
  };

  const logout = async () => {
    try {
      await Promise.allSettled([
        fetch("/api/auth/logout", { method: "POST" }),
        fetch("/api/admin/logout", { method: "POST" }),
      ]);
    } catch (err) {
      console.error("Logout error", err);
    }
    setActiveUser(null);
  };

  const refreshUsers = useCallback(async () => {
    const data = await fetchUsers();
    setActiveUserState((prev) => {
      if (!prev) return null;
      return data.find((u) => u.id === prev.id) ?? prev;
    });
  }, [fetchUsers]);

  return (
    <UserContext.Provider
      value={{
        users,
        activeUser,
        setActiveUser,
        refreshUsers,
        checkAuthSession,
        logout,
        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useUser(): UserContextType {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Maps Role enum value to a human-readable label */
export function roleLabel(role: UserRole): string {
  const map: Record<UserRole, string> = {
    PUBLIC_USER: "Public User",
    GOV_EMPLOYEE: "Gov. Employee",
    DEPT_ADMIN: "Dept. Admin",
    SUPER_ADMIN: "Super Admin",
  };
  return map[role] ?? role;
}

/** Role badge colour classes */
export function roleBadgeClass(role: UserRole): string {
  const map: Record<UserRole, string> = {
    PUBLIC_USER: "bg-slate-100 text-slate-600",
    GOV_EMPLOYEE: "bg-brand-primary/5 text-blue-700",
    DEPT_ADMIN: "bg-violet-50 text-violet-700",
    SUPER_ADMIN: "bg-amber-50 text-amber-700",
  };
  return map[role] ?? "bg-slate-100 text-slate-600";
}

/** Returns the first letter of a name for avatar initials */
export function userInitial(name: string): string {
  return name ? name.trim().charAt(0).toUpperCase() : "U";
}
