"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

type AuthContextType = {
  user: any;
  loading: boolean;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
});

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    setLoading(true);

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/user/me");
      const dbUser = await res.json();

      setUser(dbUser);
    } catch (err) {
      console.error("Failed to load user:", err);
      setUser(null);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        refreshUser: loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}