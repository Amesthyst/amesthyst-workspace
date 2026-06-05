"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");

  async function createCompany() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const res = await fetch("/api/company/create", {
      method: "POST",
      body: JSON.stringify({
        name,
        industry,
        userId: user.id,
        email: user.email,
      }),
    });

    if (!res.ok) {
      alert("Failed to create company");
      return;
    }

    router.push("/portal/dashboard");
    router.refresh();
  }

  return (
    <div className="p-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Create Your Company
      </h1>

      <input
        className="border p-2 w-full mb-4"
        placeholder="Company Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="border p-2 w-full mb-4"
        placeholder="Industry"
        value={industry}
        onChange={(e) => setIndustry(e.target.value)}
      />

      <button
        onClick={createCompany}
        className="border px-4 py-2"
      >
        Create Company
      </button>
    </div>
  );
}