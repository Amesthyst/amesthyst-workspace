"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Company = {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  logo?: string;
  code: string;
};

export default function CompanySettingsPage() {
  const [company, setCompany] = useState<Company | null>(null);

  async function load() {
    const res = await fetch("/api/user/me");
    const data = await res.json();

    setCompany(data.company);
  }

  useEffect(() => {
    load();
  }, []);

  async function copyCode() {
    if (!company?.code) return;

    await navigator.clipboard.writeText(company.code);
    alert("Company code copied!");
  }

  if (!company) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">

      <h1 className="text-2xl font-bold">
        Company Settings
      </h1>

      <Card className="p-4 space-y-2">

        <div>
          <p className="text-sm text-gray-500">
            Company Name
          </p>
          <p className="font-bold">
            {company.name}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Industry
          </p>
          <p>{company.industry || "-"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Website
          </p>
          <p>{company.website || "-"}</p>
        </div>

      </Card>

      <Card className="p-4 space-y-2 border-2 border-blue-500">

        <p className="text-sm text-gray-500">
          Company Code (for invite users)
        </p>

        <div className="flex justify-between items-center">
          <p className="font-mono text-lg">
            {company.code}
          </p>

          <Button onClick={copyCode}>
            Copy
          </Button>
        </div>

      </Card>

    </div>
  );
}