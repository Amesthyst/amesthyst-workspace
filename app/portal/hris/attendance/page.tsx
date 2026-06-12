"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Attendance = {
  id: string;
  clockIn: string | null;
  clockOut: string | null;

  workMinutes: number;
  lateMinutes: number;
  overtimeMinutes: number;
  status: string;

  employee: {
    user: {
      name: string | null;
      email: string;
    };
  };
};

export default function AttendancePage() {
  const { user } = useAuth();
  const [data, setData] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!user?.companyId) return;

    try {
      setLoading(true);

      const res = await fetch(
        `/api/hris/attendance/list?companyId=${user.companyId}`
      );

      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [user]);

  function getBadge(status: string) {
    switch (status) {
      case "PRESENT":
        return "bg-green-100 text-green-700";
      case "LATE":
        return "bg-yellow-100 text-yellow-700";
      case "OVERTIME":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Attendance Records
        </h1>
        <p className="text-muted-foreground">
          Company-wide attendance analytics
        </p>
      </div>

      {loading && (
        <Card className="p-6 text-center">
          Loading attendance...
        </Card>
      )}

      {!loading && (
        <div className="space-y-4">
          {data.map((a) => (
            <Card key={a.id} className="p-5 space-y-3">

              <div className="flex justify-between items-start">

                <div>
                  <p className="font-semibold">
                    {a.employee.user.name ?? "No Name"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {a.employee.user.email}
                  </p>
                </div>

                <Badge className={getBadge(a.status)}>
                  {a.status}
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-2 text-sm">
                <p>
                  🟢 IN:{" "}
                  {a.clockIn
                    ? new Date(a.clockIn).toLocaleString()
                    : "-"}
                </p>

                <p>
                  🔴 OUT:{" "}
                  {a.clockOut
                    ? new Date(a.clockOut).toLocaleString()
                    : "Still working"}
                </p>
              </div>

              <div className="grid grid-cols-3 text-xs text-muted-foreground pt-2 border-t">
                <p>Work: {a.workMinutes} min</p>
                <p>Late: {a.lateMinutes} min</p>
                <p>OT: {a.overtimeMinutes} min</p>
              </div>

            </Card>
          ))}
        </div>
      )}
    </div>
  );
}