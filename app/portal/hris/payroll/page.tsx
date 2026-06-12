"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Payroll = {
  id: string;
  month: number;
  year: number;

  baseSalary: number;
  allowance: number;
  deduction: number;
  totalSalary: number;

  status: "DRAFT" | "APPROVED" | "PAID" | "REJECT";

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
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    employeeId: "",
    baseSalary: "",
    allowance: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  async function load() {
    if (!user?.companyId) return;

    setLoading(true);

    const res = await fetch(
      `/api/hris/payroll?companyId=${user.companyId}`
    );

    setData(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [user]);

  async function addPayroll() {
    await fetch("/api/hris/payroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        companyId: user?.companyId,
      }),
    });

    setForm({
      employeeId: "",
      baseSalary: "",
      allowance: "",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });

    load();
  }

  async function updatePayroll(id: string, payload: any) {
    await fetch(`/api/hris/payroll/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    load();
  }

  const totalPayroll = data
    .filter((p) => p.status === "PAID")
    .reduce(
      (sum, p) =>
        sum + (p.baseSalary + p.allowance - p.deduction),
      0
    );

  const StatusBadge = ({ status }: any) => {
    const map: any = {
      DRAFT: "bg-yellow-100 text-yellow-700",
      APPROVED: "bg-blue-100 text-blue-700",
      PAID: "bg-green-100 text-green-700",
      REJECT: "bg-red-100 text-red-700",
    };

    return (
      <span className={`px-2 py-1 text-xs rounded ${map[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">Payroll System</h1>
        <p className="text-muted-foreground">
          Manage salary, approval, and payment status
        </p>
      </div>

      <Card className="p-4 space-y-3">
        <h2 className="font-bold">Add Payroll</h2>

        <div className="grid grid-cols-3 gap-2">

          <Input
            placeholder="Employee ID"
            value={form.employeeId}
            onChange={(e) =>
              setForm({ ...form, employeeId: e.target.value })
            }
          />

          <Input
            type="number"
            placeholder="Base Salary"
            value={form.baseSalary}
            onChange={(e) =>
              setForm({ ...form, baseSalary: e.target.value })
            }
          />

          <Input
            type="number"
            placeholder="Allowance"
            value={form.allowance}
            onChange={(e) =>
              setForm({ ...form, allowance: e.target.value })
            }
          />

        </div>

        <Button onClick={addPayroll}>
          Create Payroll
        </Button>
      </Card>

      <Card className="p-4">
        <h2 className="font-bold">Total Paid Payroll</h2>
        <p className="text-green-600 font-bold text-lg">
          {totalPayroll}
        </p>
      </Card>

      <Card className="p-3 font-bold">
        <div className="grid grid-cols-6 text-sm">
          <span>Employee</span>
          <span>Base</span>
          <span>Allowance</span>
          <span>Deduction</span>
          <span>Total</span>
          <span>Status / Action</span>
        </div>
      </Card>

      <div className="space-y-3">

        {data.map((p) => (
          <Card key={p.id} className="p-3">

            <div className="grid grid-cols-6 items-center gap-2 text-sm">

              <span className="font-medium">
                {p.employee.user.name}
              </span>

              <Input
                value={p.baseSalary}
                onChange={(e) =>
                  updatePayroll(p.id, {
                    baseSalary: +e.target.value,
                  })
                }
              />

              <Input
                value={p.allowance}
                onChange={(e) =>
                  updatePayroll(p.id, {
                    allowance: +e.target.value,
                  })
                }
              />

              <Input
                value={p.deduction}
                onChange={(e) =>
                  updatePayroll(p.id, {
                    deduction: +e.target.value,
                  })
                }
              />

              <span className="font-bold text-green-600">
                {p.baseSalary + p.allowance - p.deduction}
              </span>

              <div className="flex gap-2 items-center">

              <StatusBadge status={p.status} />

              <Button
                size="sm"
                disabled={p.status !== "DRAFT"}
                onClick={() =>
                  updatePayroll(p.id, { status: "APPROVED" })
                }
              >
                Approve
              </Button>

              <Button
                size="sm"
                variant="destructive"
                disabled={p.status !== "DRAFT"}
                onClick={() =>
                  updatePayroll(p.id, { status: "REJECT" })
                }
              >
                Reject
              </Button>

              <Button
                size="sm"
                disabled={p.status !== "APPROVED"}
                onClick={() =>
                  updatePayroll(p.id, { status: "PAID" })
                }
              >
                Pay
              </Button>

              </div>

            </div>

          </Card>
        ))}

      </div>

    </div>
  );
}