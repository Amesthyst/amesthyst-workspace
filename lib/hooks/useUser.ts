"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useUser() {
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
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

    load();
  }, []);

  return { user, loading };
}