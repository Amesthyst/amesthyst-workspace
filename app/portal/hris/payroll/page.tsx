"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Payroll = {
  id: string;
  month: number;
  year: number;
  baseSalary: number;
  allowance: number;
  deduction: number;
  totalSalary: number;
  status: string;

  employee: {
    user: {
      name: string;
      email: string;
    };
  };
};

export default function PayrollPage() {
  const { user } = useAuth();
  const [data, setData] = useState<Payroll[]>([]);

  async function load() {
    if (!user?.companyId) return;

    const res = await fetch(
      `/api/hris/payroll?companyId=${user.companyId}`
    );

    setData(await res.json());
  }

  useEffect(() => {
    load();
  }, [user]);

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Payroll System</h1>
        <p className="text-muted-foreground">
          Salary management & payout tracking
        </p>
      </div>

      {/* LIST */}
      <div className="grid gap-4">

        {data.map((p) => (
          <Card key={p.id} className="p-5 space-y-3">

            {/* EMPLOYEE */}
            <div>
              <h3 className="font-semibold">
                {p.employee.user.name}
              </h3>

              <p className="text-sm text-muted-foreground">
                {p.employee.user.email}
              </p>
            </div>

            {/* SALARY INFO */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">

              <div>
                <p className="text-muted-foreground">Base</p>
                <p className="font-medium">{p.baseSalary}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Allowance</p>
                <p className="font-medium">{p.allowance}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Deduction</p>
                <p className="font-medium text-red-500">
                  {p.deduction}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="font-bold text-green-600">
                  {p.totalSalary}
                </p>
              </div>

            </div>

            {/* STATUS */}
            <div className="flex justify-between items-center">

              <span className="text-xs px-3 py-1 rounded bg-gray-100">
                {p.status}
              </span>

              <div className="flex gap-2">

                <Button size="sm" variant="outline">
                  Approve
                </Button>

                <Button size="sm">
                  Mark as Paid
                </Button>

              </div>

            </div>

          </Card>
        ))}

      </div>

    </div>
  );
}