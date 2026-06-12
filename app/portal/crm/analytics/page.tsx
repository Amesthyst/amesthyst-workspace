"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";

import { useAuth } from "@/lib/context/AuthContext";

export default function CRMAnalyticsPage() {
  const { user } = useAuth();

  const [analytics, setAnalytics] =
    useState<any>(null);

  async function loadAnalytics() {
    if (!user?.companyId) return;

    const res = await fetch(
      `/api/crm/analytics?companyId=${user.companyId}`
    );

    const data = await res.json();

    setAnalytics(data);
  }

  useEffect(() => {
    loadAnalytics();
  }, [user]);

  if (!analytics) {
    return (
      <div>
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          CRM Analytics
        </h1>

        <p className="text-muted-foreground">
          Sales performance overview
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">

        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            Total Leads
          </p>

          <h2 className="text-3xl font-bold">
            {analytics.total}
          </h2>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            New
          </p>

          <h2 className="text-3xl font-bold">
            {analytics.newCount}
          </h2>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            Contacted
          </p>

          <h2 className="text-3xl font-bold">
            {analytics.contactedCount}
          </h2>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            Won
          </p>

          <h2 className="text-3xl font-bold">
            {analytics.wonCount}
          </h2>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            Lost
          </p>

          <h2 className="text-3xl font-bold">
            {analytics.lostCount}
          </h2>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            Conversion
          </p>

          <h2 className="text-3xl font-bold">
            {analytics.conversionRate}%
          </h2>
        </Card>

      </div>

      <Card className="p-6">

        <h2 className="font-semibold mb-4">
          Lead Sources
        </h2>

        <div className="space-y-3">

          {Object.entries(
            analytics.sourceMap
          ).map(([source, count]) => (
            <div
              key={source}
              className="flex justify-between border-b pb-2"
            >
              <span>{source}</span>

              <span>{String(count)}</span>
            </div>
          ))}

        </div>

      </Card>

    </div>
  );
}