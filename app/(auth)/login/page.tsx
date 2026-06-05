"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    const supabase = createClient();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    const res = await fetch("/api/user/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user?.id }),
    });

    const { needsOnboarding } = await res.json();

    router.push(
      needsOnboarding ? "/onboarding" : "/portal/dashboard"
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-6 space-y-4">

        <div>
          <h1 className="text-2xl font-bold">Login</h1>
          <p className="text-sm text-gray-500">
            Welcome back to Amesthyst Workspace
          </p>
        </div>

        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          className="w-full"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>

        <p className="text-xs text-center text-gray-500">
          Don’t have an account?{" "}
          <a className="underline" href="/register">
            Register
          </a>
        </p>

      </Card>
    </div>
  );
}