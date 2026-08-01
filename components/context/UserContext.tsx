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
  createdAt: string;
}

interface UserContextType {
  /** All users fetched from /api/users */
  users: AppUser[];
  /** The currently "active" user (simulated session) */
  activeUser: AppUser | null;
  /** Switch the active user */
  setActiveUser: (user: AppUser | null) => void;
  /** Re-fetch the user list (call after creating a new user) */
  refreshUsers: () => Promise<void>;
  isLoading: boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = "govstay_active_user_id";

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

  // On mount: fetch users, then restore the previously selected user from localStorage
  useEffect(() => {
    setIsLoading(true);
    fetchUsers().then((data) => {
      try {
        const savedId = localStorage.getItem(STORAGE_KEY);
        if (savedId) {
          const found = data.find((u) => u.id === savedId) ?? null;
          setActiveUserState(found);
        } else {
          // Default to employee with ID 245503B
          const defaultUser = data.find((u) => u.empId === "245503B") ?? null;
          if (defaultUser) {
            setActiveUserState(defaultUser);
            localStorage.setItem(STORAGE_KEY, defaultUser.id);
          }
        }
      } catch {
        // localStorage unavailable
      } finally {
        setIsLoading(false);
      }
    });
  }, [fetchUsers]);

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

  const refreshUsers = useCallback(async () => {
    const data = await fetchUsers();
    // If the active user was updated, sync it
    setActiveUserState((prev) => {
      if (!prev) return null;
      return data.find((u) => u.id === prev.id) ?? prev;
    });
  }, [fetchUsers]);

  return (
    <UserContext.Provider
      value={{ users, activeUser, setActiveUser, refreshUsers, isLoading }}
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
    GOV_EMPLOYEE: "bg-blue-50 text-blue-700",
    DEPT_ADMIN: "bg-violet-50 text-violet-700",
    SUPER_ADMIN: "bg-amber-50 text-amber-700",
  };
  return map[role] ?? "bg-slate-100 text-slate-600";
}

/** Returns the first letter of a name for avatar initials */
export function userInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase();
}
