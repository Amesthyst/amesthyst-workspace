"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { Card } from "@/components/ui/card";

type Dashboard = {
  totalEmployees: number;
  activeEmployees: number;
  departments: number;
  pendingLeaves: number;

  inactiveRate: number;
};

export default function HRISDashboardV2() {
  const { user } = useAuth();
  const [data, setData] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    departments: 0,
    pendingLeaves: 0,
    inactiveRate: 0,
  });

  async function load() {
    if (!user?.companyId) return;

    const res = await fetch(
      `/api/hris/dashboard?companyId=${user.companyId}`
    );

    setData(await res.json());
  }

  useEffect(() => {
    load();
  }, [user]);

  const activeRate =
    data?.totalEmployees
      ? Math.round(
          (data.activeEmployees / data.totalEmployees) * 100
        )
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">HRIS Command Center</h1>
        <p className="text-muted-foreground">
          Workforce intelligence & analytics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">

        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Employees</p>
          <h2 className="text-3xl font-bold">{data?.totalEmployees ?? 0}</h2>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Active Rate</p>
          <h2 className="text-3xl font-bold text-green-600">
            {activeRate}%
          </h2>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Departments</p>
          <h2 className="text-3xl font-bold">{data?.departments ?? 0}</h2>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Pending Leaves</p>
          <h2 className="text-3xl font-bold text-orange-500">
            {data?.pendingLeaves ?? 0}
          </h2>
        </Card>

      </div>

      <div className="grid gap-4 md:grid-cols-2">

        <Card className="p-5">
          <h3 className="font-semibold">Workforce Health</h3>

          <p className="text-sm text-muted-foreground mt-2">
            {activeRate > 80
              ? "Healthy workforce"
              : "Attention needed: low activity rate"}
          </p>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold">HR Insight</h3>

          <p className="text-sm text-muted-foreground mt-2">
            {data?.pendingLeaves > 5
              ? "High leave demand detected"
              : "Normal leave activity"}
          </p>
        </Card>

      </div>

    </div>
  );
}