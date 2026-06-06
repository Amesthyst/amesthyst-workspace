"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"create" | "join">("create");

  // CREATE COMPANY
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");

  // JOIN COMPANY
  const [companyCode, setCompanyCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ---------------- CREATE COMPANY ---------------- */
  async function createCompany() {
    setError("");
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const res = await fetch("/api/company/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          industry,
          userId: user.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      router.push("/portal/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  /* ---------------- JOIN COMPANY ---------------- */
  async function joinCompany() {
    setError("");
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const res = await fetch("/api/company/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          companyCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      router.push("/portal/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">

      <div className="w-full max-w-md bg-white border rounded-xl p-6">

        {/* HEADER */}
        <h1 className="text-2xl font-bold">
          Welcome to Workspace
        </h1>

        <p className="text-sm text-muted-foreground mb-6">
          Create or join a company to continue
        </p>

        {/* TAB SWITCH */}
        <div className="flex border rounded-lg mb-6 overflow-hidden">

          <button
            onClick={() => setMode("create")}
            className={`flex-1 p-2 text-sm ${
              mode === "create"
                ? "bg-black text-white"
                : "bg-white"
            }`}
          >
            Create
          </button>

          <button
            onClick={() => setMode("join")}
            className={`flex-1 p-2 text-sm ${
              mode === "join"
                ? "bg-black text-white"
                : "bg-white"
            }`}
          >
            Join
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border p-2 rounded">
            {error}
          </div>
        )}

        {/* CREATE MODE */}
        {mode === "create" && (
          <div className="space-y-3">
            <input
              className="border p-2 w-full rounded"
              placeholder="Company Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              className="border p-2 w-full rounded"
              placeholder="Industry (optional)"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />

            <button
              onClick={createCompany}
              disabled={loading}
              className="w-full bg-black text-white py-2 rounded"
            >
              {loading ? "Creating..." : "Create Company"}
            </button>
          </div>
        )}

        {/* JOIN MODE */}
        {mode === "join" && (
          <div className="space-y-3">
            <input
              className="border p-2 w-full rounded"
              placeholder="Company Code (e.g. ABC123)"
              value={companyCode}
              onChange={(e) => setCompanyCode(e.target.value)}
            />

            <button
              onClick={joinCompany}
              disabled={loading}
              className="w-full bg-black text-white py-2 rounded"
            >
              {loading ? "Joining..." : "Join Company"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}