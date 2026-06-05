"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    const supabase = createClient();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    await fetch("/api/auth/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    router.push("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-6 space-y-4">

        <div>
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-sm text-gray-500">
            Start your Amesthyst Workspace journey
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
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? "Creating account..." : "Register"}
        </Button>

        <p className="text-xs text-center text-gray-500">
          Already have an account?{" "}
          <a className="underline" href="/login">
            Login
          </a>
        </p>

      </Card>
    </div>
  );
}