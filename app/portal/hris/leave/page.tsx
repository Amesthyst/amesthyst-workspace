"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Employee = {
  id: string;

  user: {
    name: string;
    email: string;
  };
};

type LeaveRequest = {
  id: string;

  reason: string;

  status: string;

  startDate: string;
  endDate: string;

  employee: {
    user: {
      name: string;
      email: string;
    };
  };
};

export default function LeavePage() {
  const [employees, setEmployees] =
    useState<Employee[]>([]);

  const [leaves, setLeaves] =
    useState<LeaveRequest[]>([]);

  const [showCreate, setShowCreate] =
    useState(false);

  const [employeeId, setEmployeeId] =
    useState("");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  const [reason, setReason] =
    useState("");

  const [search, setSearch] =
    useState("");

  async function load() {
    const leaveRes =
      await fetch(
        `/api/hris/leave?companyId=YOUR_COMPANY_ID`
      );

    const leaveJson =
      await leaveRes.json();

    setLeaves(leaveJson);

    const empRes =
      await fetch(
        "/api/hris/employees/simple"
      );

    const empJson =
      await empRes.json();

    setEmployees(empJson);
  }

  async function createLeave() {
    const res = await fetch(
      "/api/hris/leave",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          employeeId,
          startDate,
          endDate,
          reason,
        }),
      }
    );

    if (!res.ok) {
      alert("Failed");
      return;
    }

    setEmployeeId("");
    setStartDate("");
    setEndDate("");
    setReason("");

    setShowCreate(false);

    load();
  }

  async function updateStatus(
    leaveId: string,
    status: string
  ) {
    await fetch("/api/hris/leave", {
      method: "PATCH",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        leaveId,
        status,
      }),
    });

    load();
  }

  useEffect(() => {
    load();
  }, []);

  const filtered =
    leaves.filter((l) =>
      l.employee.user.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  const pending =
    leaves.filter(
      (l) => l.status === "PENDING"
    ).length;

  const approved =
    leaves.filter(
      (l) => l.status === "APPROVED"
    ).length;

  const rejected =
    leaves.filter(
      (l) => l.status === "REJECTED"
    ).length;

  return (
    <div className="space-y-6">

      <div className="flex justify-between">

        <div>

          <h1 className="text-3xl font-bold">
            Leave Center
          </h1>

          <p className="text-muted-foreground">
            Leave Management
          </p>

        </div>

        <Button
          onClick={() =>
            setShowCreate(!showCreate)
          }
        >
          New Request
        </Button>

      </div>

      <div className="grid md:grid-cols-3 gap-4">

        <Card className="p-5">
          <h3>Pending</h3>
          <p className="text-3xl font-bold">
            {pending}
          </p>
        </Card>

        <Card className="p-5">
          <h3>Approved</h3>
          <p className="text-3xl font-bold">
            {approved}
          </p>
        </Card>

        <Card className="p-5">
          <h3>Rejected</h3>
          <p className="text-3xl font-bold">
            {rejected}
          </p>
        </Card>

      </div>

      {showCreate && (
        <Card className="p-5 space-y-4">

          <select
            className="border p-2 rounded w-full"
            value={employeeId}
            onChange={(e) =>
              setEmployeeId(
                e.target.value
              )
            }
          >
            <option value="">
              Select Employee
            </option>

            {employees.map((e) => (
              <option
                key={e.id}
                value={e.id}
              >
                {e.user.name}
              </option>
            ))}
          </select>

          <Input
            type="date"
            value={startDate}
            onChange={(e) =>
              setStartDate(
                e.target.value
              )
            }
          />

          <Input
            type="date"
            value={endDate}
            onChange={(e) =>
              setEndDate(
                e.target.value
              )
            }
          />

          <Input
            placeholder="Reason"
            value={reason}
            onChange={(e) =>
              setReason(
                e.target.value
              )
            }
          />

          <Button
            onClick={createLeave}
          >
            Submit Request
          </Button>

        </Card>
      )}

      <Input
        placeholder="Search employee..."
        value={search}
        onChange={(e) =>
          setSearch(
            e.target.value
          )
        }
      />

      <div className="grid gap-4">

        {filtered.map((leave) => (
          <Card
            key={leave.id}
            className="p-5"
          >

            <div className="flex justify-between">

              <div>

                <h3 className="font-semibold">
                  {
                    leave.employee.user
                      .name
                  }
                </h3>

                <p>
                  {leave.reason}
                </p>

                <p className="text-sm text-muted-foreground">
                  {new Date(
                    leave.startDate
                  ).toLocaleDateString()}
                  {" - "}
                  {new Date(
                    leave.endDate
                  ).toLocaleDateString()}
                </p>

              </div>

              <div className="flex gap-2">

                {leave.status ===
                  "PENDING" && (
                  <>
                    <Button
                      onClick={() =>
                        updateStatus(
                          leave.id,
                          "APPROVED"
                        )
                      }
                    >
                      Approve
                    </Button>

                    <Button
                      variant="destructive"
                      onClick={() =>
                        updateStatus(
                          leave.id,
                          "REJECTED"
                        )
                      }
                    >
                      Reject
                    </Button>
                  </>
                )}

              </div>

            </div>

            <div className="mt-3">

              <span className="text-sm font-medium">
                {leave.status}
              </span>

            </div>

          </Card>
        ))}

      </div>

    </div>
  );
}