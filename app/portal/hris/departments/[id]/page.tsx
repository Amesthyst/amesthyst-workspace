"use client";

import Link from "next/link";
import { use } from "react";
import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";

type Employee = {
  id: string;
  employeeNumber: string | null;
  jobTitle: string | null;
  status: string;
  phone: string | null;

  department?: {
    id: string;
    name: string;
  } | null;

  user: {
    name: string | null;
    email: string;
  };

  payroll: {
    totalSalary: number;
  }[];
};

type Department = {
    id: string;
    name: string;
    description: string | null;
  
    _count?: {
      employees: number;
    };
  };

type DepartmentData = {
  id: string;
  name: string;
  description: string | null;

  employees: Employee[];

  stats: {
    employees: number;
    activeEmployees: number;
    onLeaveEmployees: number;
    payrollCost: number;
  };
};

export default function DepartmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [data, setData] =
    useState<DepartmentData | null>(null);

  const [departments, setDepartments] =
    useState<Department[]>([]);
  
  const [selectedDepartment, setSelectedDepartment] =
    useState<Record<string, string>>({});

  const [showAssign, setShowAssign] =
    useState(false);

  const [loadingAssign, setLoadingAssign] =
    useState(false);

  const [availableEmployees, setAvailableEmployees] =
    useState<Employee[]>([]);

    async function load() {
        const res = await fetch(
          `/api/hris/departments/${id}`
        );
      
        const json = await res.json();
      
        setData(json);
      
        if (json.companyId) {
          loadDepartments(json.companyId);
        }
      }

  async function loadDepartments(companyId: string) {
    const res = await fetch(
      `/api/hris/departments?companyId=${companyId}`
    );
  
    const json = await res.json();
  
    setDepartments(json);
  }

  async function loadAvailableEmployees() {
    const res = await fetch(
      "/api/hris/employees/transferable"
    );

    const json = await res.json();

    setAvailableEmployees(json);
  }

  
  async function transferEmployee(
    employeeId: string,
    departmentId: string
  ) {
    try {
      setLoadingAssign(true);
  
      const res = await fetch(
        `/api/hris/departments/${departmentId}/assign`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            employeeId,
          }),
        }
      );
  
      const json = await res.json();
  
      if (!res.ok) {
        alert(
          json.error ||
            "Failed to transfer employee"
        );
        return;
      }
  
      await load();
      await loadAvailableEmployees();
  
      alert(
        json.message ||
          "Employee transferred successfully"
      );
    } finally {
      setLoadingAssign(false);
    }
  }

  useEffect(() => {
    load();
    loadAvailableEmployees();
  }, [id]);

  if (!data) {
    return (
      <Card className="p-6">
        Loading...
      </Card>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">
          {data.name}
        </h1>

        <p className="text-muted-foreground">
          {data.description ||
            "No description"}
        </p>
      </div>

      {/* KPI */}
      <div className="grid md:grid-cols-4 gap-4">

        <Card className="p-5">
          <p className="text-sm text-muted-foreground">
            Employees
          </p>

          <h2 className="text-3xl font-bold">
            {data.stats.employees}
          </h2>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-muted-foreground">
            Active
          </p>

          <h2 className="text-3xl font-bold text-green-600">
            {data.stats.activeEmployees}
          </h2>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-muted-foreground">
            On Leave
          </p>

          <h2 className="text-3xl font-bold text-yellow-600">
            {data.stats.onLeaveEmployees}
          </h2>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-muted-foreground">
            Payroll Cost
          </p>

          <h2 className="text-xl font-bold">
            Rp{" "}
            {data.stats.payrollCost.toLocaleString()}
          </h2>
        </Card>

      </div>

      {/* EMPLOYEE TABLE */}
      <Card className="p-6">

        <div className="flex justify-between items-center mb-4">

          <h2 className="text-lg font-semibold">
            Employees
          </h2>

          <Button
            onClick={() => {
              loadAvailableEmployees();
              setShowAssign(true);
            }}
          >
            Assign Employee
          </Button>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>
              <tr className="border-b">
                <th className="text-left py-3">
                  Employee #
                </th>

                <th className="text-left py-3">
                  Name
                </th>

                <th className="text-left py-3">
                  Job Title
                </th>

                <th className="text-left py-3">
                  Status
                </th>

                <th className="text-left py-3">
                  Salary
                </th>
              </tr>
            </thead>

            <tbody>

              {data.employees.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-6 text-center text-muted-foreground"
                  >
                    No employees assigned
                  </td>
                </tr>
              ) : (
                data.employees.map(
                  (employee) => (
                    <tr
                      key={employee.id}
                      className="border-b"
                    >
                      <td className="py-3">
                        {employee.employeeNumber ??
                          "-"}
                      </td>

                      <td>
                        <div>

                          <Link
                            href={`/portal/hris/employees/${employee.id}`}
                            className="font-medium hover:underline"
                          >
                            {employee.user.name ??
                              "Unknown"}
                          </Link>

                          <p className="text-xs text-muted-foreground">
                            {
                              employee.user
                                .email
                            }
                          </p>

                        </div>
                      </td>

                      <td>
                        {employee.jobTitle ??
                          "-"}
                      </td>

                      <td>

                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            employee.status ===
                            "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : employee.status ===
                                "ON_LEAVE"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {
                            employee.status
                          }
                        </span>

                      </td>

                      <td>
                        Rp{" "}
                        {employee.payroll[0]?.totalSalary?.toLocaleString() ??
                          "0"}
                      </td>
                    </tr>
                  )
                )
              )}

            </tbody>

          </table>

        </div>

      </Card>

      {/* ASSIGN / TRANSFER */}
      {showAssign && (

        <Card className="p-6">

          <div className="flex justify-between items-center mb-4">

            <h2 className="text-lg font-semibold">
              Assign / Transfer Employee
            </h2>

            <Button
              variant="outline"
              onClick={() =>
                setShowAssign(false)
              }
            >
              Close
            </Button>

          </div>

          <div className="space-y-3">

            {availableEmployees.length ===
            0 ? (
              <p className="text-muted-foreground">
                No available employees.
              </p>
            ) : (
              availableEmployees.map(
                (employee) => (

                  <div
                    key={employee.id}
                    className="border rounded-lg p-4 flex justify-between items-center"
                  >

                    <div>

                      <p className="font-medium">
                        {
                          employee.user
                            .name
                        }
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {
                          employee.user
                            .email
                        }
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {employee.jobTitle ??
                          "No Job Title"}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Current Department:{" "}
                        {employee.department
                          ?.name ??
                          "Unassigned"}
                      </p>

                    </div>

                    <div className="flex items-center gap-2">

                    <Select
                        value={
                        selectedDepartment[
                            employee.id
                        ] || ""
                        }
                        onValueChange={(value) =>
                        setSelectedDepartment(
                            (prev) => ({
                            ...prev,
                            [employee.id]: value,
                            })
                        )
                        }
                    >
                        <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="Select Department" />
                        </SelectTrigger>

                        <SelectContent>

                        {departments
                            .filter(
                            (d) =>
                                d.id !==
                                employee.department?.id
                            )
                            .map((dept) => (
                            <SelectItem
                                key={dept.id}
                                value={dept.id}
                            >
                                {dept.name}
                            </SelectItem>
                            ))}

                        </SelectContent>

                    </Select>

                    <Button
                        disabled={
                        loadingAssign ||
                        !selectedDepartment[
                            employee.id
                        ]
                        }
                        onClick={() =>
                        transferEmployee(
                            employee.id,
                            selectedDepartment[
                            employee.id
                            ]
                        )
                        }
                    >
                        {employee.department
                        ? "Transfer"
                        : "Assign"}
                    </Button>

                    </div>

                  </div>

                )
              )
            )}

          </div>

        </Card>

      )}

    </div>
  );
}