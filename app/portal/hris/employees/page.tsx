"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Employee = {
  id: string;
  jobTitle: string | null;
  status: string;

  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

export default function EmployeesPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [editingEmployee, setEditingEmployee] =
    useState<Employee | null>(null);

  const [editName, setEditName] = useState("");
  const [editJobTitle, setEditJobTitle] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadEmployees() {
    if (!user?.companyId) return;

    try {
      setLoading(true);

      const res = await fetch(
        `/api/hris/employees?companyId=${user.companyId}`
      );

      const data = await res.json();

      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, [user]);

  const filtered = useMemo(() => {
    return employees.filter((emp) =>
      `${emp.user.name ?? ""} ${emp.user.email}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [employees, search]);

  const total = employees.length;
  const active = employees.filter(
    (e) => e.status === "ACTIVE"
  ).length;

  function openEdit(emp: Employee) {
    setEditingEmployee(emp);
    setEditName(emp.user.name ?? "");
    setEditJobTitle(emp.jobTitle ?? "");
  }

  function closeEdit() {
    setEditingEmployee(null);
    setEditName("");
    setEditJobTitle("");
  }

  async function saveEmployee() {
    if (!editingEmployee) return;

    try {
      setSaving(true);

      const res = await fetch(
        `/api/hris/employees/${editingEmployee.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editName,
            jobTitle: editJobTitle,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed");
        return;
      }

      closeEdit();
      loadEmployees();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Employee Directory
        </h1>
        <p className="text-muted-foreground">
          Click employee to view full profile
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">

        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Total</p>
          <h2 className="text-2xl font-bold">{total}</h2>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Active</p>
          <h2 className="text-2xl font-bold text-green-600">
            {active}
          </h2>
        </Card>

      </div>

      <Card className="p-4">
        <Input
          placeholder="Search employee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      {loading && (
        <Card className="p-6 text-center">
          Loading employees...
        </Card>
      )}

      {!loading && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">

          {filtered.map((emp) => (
            <Card
              key={emp.id}
              className="p-5 cursor-pointer hover:shadow-md transition"
              onClick={() =>
                router.push(
                  `/portal/hris/employees/${emp.id}`
                )
              }
            >

              <div className="flex justify-between">

                <div>
                  <h3 className="font-semibold">
                    {emp.user.name ?? "No Name"}
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    {emp.user.email}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                >
                  View Profile
                </Button>

              </div>

              <p className="mt-3 text-sm">
                {emp.jobTitle || "No Job Title"}
              </p>

              <span
                className={`text-xs px-2 py-1 rounded mt-2 inline-block ${
                  emp.status === "ACTIVE"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {emp.status}
              </span>

            </Card>
          ))}

        </div>
      )}

      {!loading && filtered.length === 0 && (
        <Card className="p-10 text-center">
          No employees found
        </Card>
      )}

      {editingEmployee && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <Card className="p-6 w-full max-w-md space-y-4">

            <h2 className="text-xl font-bold">
              Edit Employee
            </h2>

            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Name"
            />

            <Input
              value={editJobTitle}
              onChange={(e) => setEditJobTitle(e.target.value)}
              placeholder="Job Title"
            />

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={closeEdit}
              >
                Cancel
              </Button>

              <Button
                onClick={saveEmployee}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>

          </Card>

        </div>
      )}

    </div>
  );
}