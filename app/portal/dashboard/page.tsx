"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type DashboardStats = {
  leads: number;
  employees: number;
  projects: number;
  wonDeals: number;
};

type Activity = {
  id: string;
  type: string;
  description: string;
  createdAt: string;
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);

  const [stats, setStats] = useState<DashboardStats>({
    leads: 0,
    employees: 0,
    projects: 0,
    wonDeals: 0,
  });

  const [activities, setActivities] = useState<Activity[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // -----------------------
  // LOAD DATA
  // -----------------------
  useEffect(() => {
    async function load() {
      if (!user?.companyId) return;

      try {
        const [statsRes, actRes] = await Promise.all([
          fetch(`/api/dashboard/stats?companyId=${user.companyId}`),
          fetch(`/api/dashboard/activity?companyId=${user.companyId}`),
        ]);

        const statsData = await statsRes.json();
        const actData = await actRes.json();

        setStats(statsData);
        setActivities(actData);
      } finally {
        setStatsLoading(false);
      }
    }

    load();
  }, [user]);

  useEffect(() => {
    async function loadAnalytics() {
      if (!user?.companyId) return;
  
      const res = await fetch(
        `/api/dashboard/analytics?companyId=${user.companyId}`
      );
  
      const data = await res.json();
      setAnalytics(data);
    }
  
    loadAnalytics();
  }, [user]);

  // -----------------------
  // LOADING
  // -----------------------
  if (loading || statsLoading) {
    return (
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Loading workspace...
        </p>
      </div>
    );
  }

  // -----------------------
  // UI HELPERS
  // -----------------------
  const kpi = [
    {
      label: "Total Leads",
      value: stats.leads,
    },
    {
      label: "Employees",
      value: stats.employees,
    },
    {
      label: "Projects",
      value: stats.projects,
    },
    {
      label: "Won Deals",
      value: stats.wonDeals,
    },
  ];

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back{user?.name ? `, ${user.name}` : ""}
        </h1>

        <p className="text-muted-foreground mt-1">
          Here’s your workspace overview and performance summary.
        </p>
      </div>

      {/* KPI SECTION */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {kpi.map((item) => (
          <Card
            key={item.label}
            className="p-6 hover:shadow-md transition"
          >
            <p className="text-sm text-muted-foreground">
              {item.label}
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {item.value}
            </h2>
          </Card>
        ))}

      </div>

      {/* ANALYTICS SECTION */}
      <div className="grid lg:grid-cols-2 gap-6">

      {/* PIPELINE BREAKDOWN */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">
          Deal Stages
        </h2>

        {analytics && (
          <div className="space-y-3 text-sm">

            <p>NEW: {analytics.pipeline.NEW}</p>
            <p>CONTACTED: {analytics.pipeline.CONTACTED}</p>
            <p>WON: {analytics.pipeline.WON}</p>
            <p>LOST: {analytics.pipeline.LOST}</p>

          </div>
        )}
      </Card>

      {/* SALES INSIGHTS */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">
          Sales Insights
        </h2>

        {analytics && (
          <div className="space-y-4 text-sm text-muted-foreground">

            <p>
              💰 Revenue:{" "}
              <span className="text-black font-medium">
                ${analytics.revenue}
              </span>
            </p>

            <p>
              📊 Win Rate:{" "}
              <span className="text-black font-medium">
                {analytics.winRate.toFixed(1)}%
              </span>
            </p>

            <p>
              📈 Forecast:{" "}
              <span className="text-black font-medium">
                ${analytics.forecast}
              </span>
            </p>

          </div>
        )}
      </Card>

      </div>

      {/* MAIN GRID */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* LEFT - ACTIVITY FEED */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              Recent Activity
            </h2>

            <Button
              variant="outline"
              onClick={() =>
                router.push("/portal/crm/activities")
              }
            >
              View All
            </Button>
          </div>

          <div className="space-y-4">

            {activities.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No activity yet. Start by creating leads or projects.
              </p>
            ) : (
              activities.map((a) => (
                <div
                  key={a.id}
                  className="border-b pb-3 last:border-none"
                >
                  <div className="flex justify-between">
                    <p className="font-medium">
                      {a.type}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {new Date(a.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <p className="text-sm text-muted-foreground mt-1">
                    {a.description}
                  </p>
                </div>
              ))
            )}

          </div>
        </Card>

        {/* RIGHT - INSIGHTS + ACTIONS */}
        <div className="space-y-6">

          {/* INSIGHTS */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              Insights
            </h2>

            <div className="space-y-3 text-sm text-muted-foreground">

              <p>
                • Your CRM is active with{" "}
                <span className="font-medium text-black">
                  {stats.leads}
                </span>{" "}
                leads.
              </p>

              <p>
                • Conversion rate improving if Won Deals increase.
              </p>

              <p>
                • Projects are currently at{" "}
                <span className="font-medium text-black">
                  {stats.projects}
                </span>
                .
              </p>

            </div>
          </Card>

          {/* QUICK ACTIONS */}
          <Card className="p-6 space-y-3">
            <h2 className="text-lg font-semibold">
              Quick Actions
            </h2>

            <Button
              className="w-full justify-start"
              onClick={() => router.push("/portal/crm")}
            >
              + Create Lead
            </Button>

            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => router.push("/portal/hris")}
            >
              + Add Employee
            </Button>

            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() =>
                router.push("/portal/projects")
              }
            >
              + New Project
            </Button>
          </Card>

        </div>
      </div>

    </div>
  );
}