"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type UserType = {
  id: string;
  name: string | null;
  email: string;

  role: {
    name: string;
  } | null;

  employee: {
    jobTitle: string | null;
  } | null;
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadUsers() {
    setLoading(true);

    const res = await fetch("/api/user/list");
    const data = await res.json();

    setUsers(data);
    setLoading(false);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function updateRole(userId: string, roleName: string) {
    const confirmed = window.confirm(
      `Change role to ${roleName}?`
    );

    if (!confirmed) return;

    await fetch("/api/user/role", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, roleName }),
    });

    loadUsers();
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Users & Roles
        </h1>

        <p className="text-muted-foreground">
          Manage company access and permissions
        </p>
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground">
          Loading users...
        </p>
      )}

      <div className="grid gap-4">

        {users.map((user) => {
          const isOwner = user.role?.name === "OWNER";

          return (
            <Card
              key={user.id}
              className="
                p-5
                rounded-xl
                border
                hover:shadow-md
                transition-all
              "
            >

              <div className="flex justify-between items-start">

                <div>
                  <h3 className="font-semibold text-lg">
                    {user.name || "No Name"}
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    {user.email}
                  </p>

                  <p className="text-xs mt-1 text-muted-foreground">
                    {user.employee?.jobTitle || "No Job Title"}
                  </p>
                </div>

                <div>
                  <span
                    className={`
                      text-xs px-3 py-1 rounded-full font-medium
                      ${
                        user.role?.name === "OWNER"
                          ? "bg-yellow-100 text-yellow-800"
                          : user.role?.name === "ADMIN"
                          ? "bg-blue-100 text-blue-700"
                          : user.role?.name === "MANAGER"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-700"
                      }
                    `}
                  >
                    {user.role?.name || "NO ROLE"}
                  </span>
                </div>

              </div>

              <div className="mt-4 flex flex-wrap gap-2">

                {isOwner ? (
                  <div className="text-xs text-muted-foreground italic">
                    Owner role is protected and cannot be modified
                  </div>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateRole(user.id, "EMPLOYEE")
                      }
                    >
                      Employee
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateRole(user.id, "MANAGER")
                      }
                    >
                      Manager
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateRole(user.id, "ADMIN")
                      }
                    >
                      Admin
                    </Button>
                  </>
                )}

              </div>

            </Card>
          );
        })}

      </div>
    </div>
  );
}