"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type AuthContextType = {
  user: any;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const res = await fetch("/api/user/me");
      const dbUser = await res.json();

      setUser(dbUser);
      setLoading(false);
    }

    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}