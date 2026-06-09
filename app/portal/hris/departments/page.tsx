"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import Link from "next/link";

type Department = {
  id: string;
  name: string;
  description: string | null;

  _count: {
    employees: number;
  };
};

export default function DepartmentsPage() {
  const { user } = useAuth();

  const [data, setData] = useState<Department[]>([]);
  const [search, setSearch] = useState("");

  const [creating, setCreating] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");

  async function load() {
    if (!user?.companyId) return;

    const res = await fetch(
      `/api/hris/departments?companyId=${user.companyId}`
    );

    const json = await res.json();

    setData(json);
  }

  useEffect(() => {
    load();
  }, [user]);

  async function createDepartment() {
    if (!name.trim()) {
      alert("Department name required");
      return;
    }

    const res = await fetch(
      "/api/hris/departments",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          companyId: user?.companyId,
          name,
          description,
        }),
      }
    );

    if (!res.ok) {
      alert("Failed to create");
      return;
    }

    setName("");
    setDescription("");

    setCreating(false);

    load();
  }

  async function deleteDepartment(
    id: string
  ) {
    const confirmed = confirm(
      "Delete this department?"
    );

    if (!confirmed) return;

    const res = await fetch(
      `/api/hris/departments/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!res.ok) {
      alert("Failed to delete");
      return;
    }

    load();
  }

  const filtered = data.filter((d) =>
    d.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalEmployees = data.reduce(
    (sum, d) =>
      sum + d._count.employees,
    0
  );

  const largestDepartment =
    data.length > 0
      ? [...data].sort(
          (a, b) =>
            b._count.employees -
            a._count.employees
        )[0]
      : null;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold">
            Departments
          </h1>

          <p className="text-muted-foreground">
            Organization structure overview
          </p>
        </div>

        <Button
          onClick={() =>
            setCreating(!creating)
          }
        >
          + Department
        </Button>

      </div>

      {/* SEARCH */}
      <Input
        placeholder="Search department..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
      />

      {/* CREATE */}
      {creating && (
        <Card className="p-5 space-y-4">

          <h3 className="font-semibold">
            Create Department
          </h3>

          <Input
            placeholder="Department Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />

          <Input
            placeholder="Description"
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
          />

          <div className="flex gap-2">

            <Button
              onClick={
                createDepartment
              }
            >
              Create Department
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                setCreating(false)
              }
            >
              Cancel
            </Button>

          </div>

        </Card>
      )}

      {/* SUMMARY */}
      <div className="grid md:grid-cols-3 gap-4">

        <Card className="p-5">
          <p className="text-sm text-muted-foreground">
            Total Departments
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {data.length}
          </h2>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-muted-foreground">
            Total Employees
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {totalEmployees}
          </h2>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-muted-foreground">
            Largest Department
          </p>

          <h2 className="text-lg font-bold mt-2">
            {largestDepartment?.name ??
              "-"}
          </h2>

          <p className="text-xs text-muted-foreground mt-1">
            {largestDepartment?._count
              .employees ?? 0}{" "}
            employees
          </p>
        </Card>

      </div>

      {/* EMPTY STATE */}
      {filtered.length === 0 && (
        <Card className="p-10 text-center">

          <h3 className="font-semibold">
            No Departments Found
          </h3>

          <p className="text-sm text-muted-foreground mt-2">
            Create your first department
            or adjust your search.
          </p>

        </Card>
      )}

      {/* DEPARTMENT GRID */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

        {filtered.map((d) => (
          <Card
            key={d.id}
            className="p-5 hover:shadow-md transition"
          >

            <div className="flex justify-between items-start">

              <div>
                <h3 className="font-semibold text-lg">
                  {d.name}
                </h3>

                <p className="text-sm text-muted-foreground mt-1">
                  {d.description ||
                    "No description"}
                </p>
              </div>

              <Button
                size="sm"
                variant="destructive"
                onClick={() =>
                  deleteDepartment(
                    d.id
                  )
                }
              >
                Delete
              </Button>

            </div>

            <div className="mt-5 border-t pt-4">

              <p className="text-xs text-muted-foreground">
                Employees
              </p>

              <p className="text-3xl font-bold mt-1">
                {
                  d._count
                    .employees
                }
              </p>

            </div>

            <div className="mt-5">

              <Link
                href={`/portal/hris/departments/${d.id}`}
              >
                <Button
                  className="w-full"
                  variant="outline"
                >
                  View Department
                </Button>
              </Link>

            </div>

          </Card>
        ))}

      </div>

    </div>
  );
}