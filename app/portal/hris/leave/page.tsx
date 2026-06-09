"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

export default function LeavePageV2() {
  const [leaves, setLeaves] = useState<any[]>([]);

  async function load() {
    const res = await fetch("/api/hris/leave");
    setLeaves(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">Leave Center</h1>
        <p className="text-muted-foreground">
          Approval + leave analytics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">

        {leaves.map((l) => (
          <Card key={l.id} className="p-5 space-y-2">

            <h3 className="font-semibold">
              {l.employee.user.name}
            </h3>

            <p className="text-sm">{l.reason}</p>

            <p className="text-xs text-muted-foreground">
              {l.status}
            </p>

          </Card>
        ))}

      </div>

    </div>
  );
}