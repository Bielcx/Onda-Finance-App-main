import { create } from "zustand";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const stored = localStorage.getItem("onda-auth");
const initial = stored ? JSON.parse(stored) : null;

export const useAuthStore = create<AuthState>((set) => ({
  user: initial?.user ?? null,
  isAuthenticated: !!initial?.user,
  login: (user) => {
    localStorage.setItem("onda-auth", JSON.stringify({ user }));
    set({ user, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem("onda-auth");
    set({ user: null, isAuthenticated: false });
  },
}));
