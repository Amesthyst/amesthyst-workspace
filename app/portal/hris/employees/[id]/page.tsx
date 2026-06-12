"use client";

import { use, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type EmployeeData = {
  id: string;
  jobTitle: string | null;
  status: string;
  phone: string | null;
  address: string | null;
  employeeNumber: string | null;
  hireDate: string | null;
  birthDate: string | null;

  user: {
    name: string;
    email: string;
  };

  department?: {
    name: string;
  };

  attendance: {
    id: string;
    clockIn: string;
    clockOut: string | null;
  }[];

  leaveRequests: {
    id: string;
    reason: string;
    status: string;
  }[];

  payroll: {
    id: string;
    totalSalary: number;
    month: number;
    year: number;
    status: string;
  }[];
};

export default function EmployeeProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [data, setData] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  // EMPLOYEE FORM ONLY
  const [form, setForm] = useState({
    name: "",
    jobTitle: "",
    phone: "",
    address: "",
    employeeNumber: "",
    status: "ACTIVE",
    hireDate: "",
    birthDate: "",
  });

  async function load() {
    try {
      setLoading(true);

      const res = await fetch(`/api/hris/employees/${id}`);
      const json = await res.json();

      if (!res.ok) {
        setData(null);
        return;
      }

      setData(json);

      setForm({
        name: json.user?.name ?? "",
        jobTitle: json.jobTitle ?? "",
        phone: json.phone ?? "",
        address: json.address ?? "",
        employeeNumber: json.employeeNumber ?? "",
        status: json.status ?? "ACTIVE",
        hireDate: json.hireDate ? json.hireDate.split("T")[0] : "",
        birthDate: json.birthDate ? json.birthDate.split("T")[0] : "",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function saveEmployee() {
    const res = await fetch(`/api/hris/employees/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        jobTitle: form.jobTitle,
        phone: form.phone,
        address: form.address,
        employeeNumber: form.employeeNumber,
        status: form.status,
        hireDate: form.hireDate,
        birthDate: form.birthDate,
      }),
    });

    if (!res.ok) {
      alert("Failed to update employee");
      return;
    }

    setEditing(false);
    await load();
  }

  if (loading) {
    return <Card className="p-6">Loading...</Card>;
  }

  if (!data) {
    return <Card className="p-6">Employee not found</Card>;
  }

  // Get latest payroll (READ ONLY)
  const latestPayroll = data.payroll?.sort(
    (a, b) => b.year - a.year || b.month - a.month
  )[0];

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Employee Profile</h1>
          <p className="text-muted-foreground">
            Full HRIS record overview
          </p>
        </div>

        <Button
          onClick={() =>
            editing ? saveEmployee() : setEditing(true)
          }
        >
          {editing ? "Save Changes" : "Edit Employee"}
        </Button>
      </div>

      {/* EMPLOYEE INFO */}
      <Card className="p-6 space-y-4">
        <div>
          <h2 className="text-xl font-bold">{data.user.name}</h2>
          <p className="text-muted-foreground">{data.user.email}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Input
            disabled={!editing}
            value={form.employeeNumber}
            onChange={(e) =>
              setForm({ ...form, employeeNumber: e.target.value })
            }
            placeholder="Employee Number"
          />

          <Input
            disabled={!editing}
            value={form.jobTitle}
            onChange={(e) =>
              setForm({ ...form, jobTitle: e.target.value })
            }
            placeholder="Job Title"
          />

          <Input
            disabled={!editing}
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
            placeholder="Phone"
          />

          <Input
            disabled={!editing}
            value={form.address}
            onChange={(e) =>
              setForm({ ...form, address: e.target.value })
            }
            placeholder="Address"
          />
        </div>

        <select
          disabled={!editing}
          value={form.status}
          onChange={(e) =>
            setForm({ ...form, status: e.target.value })
          }
          className="w-full h-10 rounded-md border px-3 text-sm"
        >
          <option value="ACTIVE">ACTIVE</option>
          <option value="ON_LEAVE">ON LEAVE</option>
          <option value="RESIGNED">RESIGNED</option>
          <option value="TERMINATED">TERMINATED</option>
        </select>
      </Card>

      {/* EMPLOYMENT */}
      <Card className="p-6 space-y-4">
        <h3 className="font-semibold">Employment Info</h3>

        <Input
          disabled={!editing}
          type="date"
          value={form.hireDate}
          onChange={(e) =>
            setForm({ ...form, hireDate: e.target.value })
          }
        />

        <Input
          disabled={!editing}
          type="date"
          value={form.birthDate}
          onChange={(e) =>
            setForm({ ...form, birthDate: e.target.value })
          }
        />

        <p>
          Department: {data.department?.name ?? "Not Assigned"}
        </p>
      </Card>

      {/* PAYROLL (READ ONLY FIXED) */}
      <Card className="p-6 space-y-3">
        <h3 className="font-semibold">Payroll (Latest)</h3>

        {!latestPayroll ? (
          <p className="text-muted-foreground">
            No payroll data available
          </p>
        ) : (
          <div className="space-y-2 text-sm">
            <p>Status: <b>{latestPayroll.status}</b></p>
            <p>Period: {latestPayroll.month}/{latestPayroll.year}</p>
            <p>Total Salary: <b>{latestPayroll.totalSalary}</b></p>
          </div>
        )}
      </Card>

      {/* ATTENDANCE */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Attendance Overview</h3>

        {Object.entries(
          data.attendance.reduce((acc: any, a) => {
            const date = new Date(a.clockIn).toDateString();
            if (!acc[date]) acc[date] = [];
            acc[date].push(a);
            return acc;
          }, {})
        ).map(([date, records]: any) => (
          <div key={date} className="border rounded p-4 mb-3">
            <p className="font-medium">{date}</p>

            {records.map((a: any) => (
              <div key={a.id} className="text-sm text-muted-foreground">
                IN: {new Date(a.clockIn).toLocaleTimeString()} | OUT:{" "}
                {a.clockOut
                  ? new Date(a.clockOut).toLocaleTimeString()
                  : "—"}
              </div>
            ))}
          </div>
        ))}
      </Card>

      {/* LEAVE */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Leave Requests</h3>

        {data.leaveRequests.map((l) => (
          <div key={l.id} className="border p-3 rounded mb-2">
            <p>{l.reason}</p>
            <p className="text-sm">{l.status}</p>
          </div>
        ))}
      </Card>

    </div>
  );
}