"use client";

import { useEffect, useState } from "react";
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

export default function HRISPage() {
  const { user } = useAuth();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");

  const [editingEmployee, setEditingEmployee] =
    useState<Employee | null>(null);

  const [editName, setEditName] = useState("");
  const [editJobTitle, setEditJobTitle] = useState("");

  const [saving, setSaving] = useState(false);

  async function loadEmployees() {
    if (!user?.companyId) return;

    try {
      const res = await fetch(
        `/api/hris/employees?companyId=${user.companyId}`
      );

      const data = await res.json();

      setEmployees(data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, [user]);

  function openEdit(emp: Employee) {
    setEditingEmployee(emp);

    setEditName(emp.user.name ?? "");
    setEditJobTitle(emp.jobTitle ?? "");
  }

  async function saveEmployee() {
    if (!editingEmployee) return;

    const confirmed = window.confirm(
      "Save changes to employee?"
    );

    if (!confirmed) return;

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

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to update employee");
        return;
      }

      setEditingEmployee(null);

      await loadEmployees();

      alert("Employee updated successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to update employee");
    } finally {
      setSaving(false);
    }
  }

  const filteredEmployees = employees.filter((emp) =>
    `${emp.user.name ?? ""} ${emp.user.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">
          Employee Management
        </h1>

        <p className="text-muted-foreground">
          Manage employees inside your company
        </p>
      </div>

      {/* STATS */}
      <div className="grid gap-4 md:grid-cols-3">

        <Card className="p-5">
          <p className="text-sm text-muted-foreground">
            Total Employees
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {employees.length}
          </h2>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-muted-foreground">
            Active Employees
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {
              employees.filter(
                (e) => e.status === "ACTIVE"
              ).length
            }
          </h2>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-muted-foreground">
            Inactive Employees
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {
              employees.filter(
                (e) => e.status !== "ACTIVE"
              ).length
            }
          </h2>
        </Card>

      </div>

      {/* SEARCH */}
      <Card className="p-4">
        <Input
          placeholder="Search employee by name or email..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />
      </Card>

      {/* EMPLOYEE GRID */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

        {filteredEmployees.map((emp) => (
          <Card
            key={emp.id}
            className="
              p-5
              hover:shadow-lg
              transition-all
              duration-200
            "
          >
            <div className="flex justify-between items-start">

              <div>
                <h3 className="font-semibold text-lg">
                  {emp.user.name ?? "No Name"}
                </h3>

                <p className="text-sm text-muted-foreground">
                  {emp.user.email}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => openEdit(emp)}
              >
                Edit
              </Button>

            </div>

            <div className="mt-5 space-y-3">

              <div>
                <p className="text-xs text-muted-foreground">
                  Job Title
                </p>

                <p className="font-medium">
                  {emp.jobTitle || "Not Assigned"}
                </p>
              </div>

              <div>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    emp.status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {emp.status}
                </span>
              </div>

            </div>
          </Card>
        ))}

      </div>

      {/* EMPTY STATE */}
      {filteredEmployees.length === 0 && (
        <Card className="p-10 text-center">
          <h3 className="font-semibold">
            No employees found
          </h3>

          <p className="text-sm text-muted-foreground mt-2">
            Try changing your search keyword.
          </p>
        </Card>
      )}

      {/* EDIT MODAL */}
      {editingEmployee && (
        <div
          className="
            fixed inset-0
            bg-black/40
            flex items-center justify-center
            z-50
          "
        >
          <Card className="w-full max-w-md p-6 space-y-5">

            <div>
              <h2 className="text-xl font-bold">
                Edit Employee
              </h2>

              <p className="text-sm text-muted-foreground">
                Update employee information
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Full Name
              </label>

              <Input
                value={editName}
                onChange={(e) =>
                  setEditName(e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Job Title
              </label>

              <Input
                value={editJobTitle}
                onChange={(e) =>
                  setEditJobTitle(e.target.value)
                }
              />
            </div>

            <div className="flex justify-end gap-2">

              <Button
                variant="outline"
                onClick={() =>
                  setEditingEmployee(null)
                }
              >
                Cancel
              </Button>

              <Button
                onClick={saveEmployee}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </Button>

            </div>

          </Card>
        </div>
      )}
    </div>
  );
}