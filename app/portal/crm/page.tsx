"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type Lead = {
  id: string;
  companyId: string;

  name: string;
  email: string | null;
  phone: string | null;
  source: string | null;

  status: string;

  createdAt: string;
  updatedAt: string;
};

export default function CRMPage() {
  const { user, loading } = useAuth();

  const [leads, setLeads] = useState<Lead[]>([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("ALL");

  async function loadLeads() {
    if (!user?.companyId) return;

    const res = await fetch(
      `/api/crm/leads?companyId=${user.companyId}`
    );

    const data = await res.json();

    setLeads(data);
  }

  async function createLead() {
    if (!name.trim()) {
      alert("Lead name is required");
      return;
    }

    const res = await fetch(
      "/api/crm/leads",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          companyId: user?.companyId,
          name,
          email,
          phone,
          source,
        }),
      }
    );

    if (!res.ok) {
      alert("Failed to create lead");
      return;
    }

    setName("");
    setEmail("");
    setPhone("");
    setSource("");

    loadLeads();
  }

  async function updateStatus(
    leadId: string,
    status: string
  ) {
    const res = await fetch(
      "/api/crm/leads/status",
      {
        method: "PATCH",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          leadId,
          status,
        }),
      }
    );

    if (!res.ok) {
      alert("Failed to update status");
      return;
    }

    loadLeads();
  }

  useEffect(() => {
    if (user?.companyId) {
      loadLeads();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="p-6 text-muted-foreground">
        Loading CRM...
      </div>
    );
  }

  const filteredLeads = leads
    .filter((lead) => {
      const term =
        search.toLowerCase();

      return (
        lead.name
          ?.toLowerCase()
          .includes(term) ||
        lead.email
          ?.toLowerCase()
          .includes(term) ||
        lead.phone
          ?.toLowerCase()
          .includes(term) ||
        lead.source
          ?.toLowerCase()
          .includes(term)
      );
    })
    .filter((lead) =>
      statusFilter === "ALL"
        ? true
        : lead.status ===
          statusFilter
    );

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">
          CRM Leads
        </h1>

        <p className="text-muted-foreground">
          Manage your sales pipeline
        </p>
      </div>

      {/* CREATE LEAD */}
      <Card className="p-6 space-y-4">

        <h2 className="font-semibold text-lg">
          Create Lead
        </h2>

        <div className="grid md:grid-cols-2 gap-4">

          <Input
            placeholder="Lead Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />

          <Input
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <Input
            placeholder="Phone Number"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
          />

          <Input
            placeholder="Source (Website, LinkedIn, Referral...)"
            value={source}
            onChange={(e) =>
              setSource(e.target.value)
            }
          />

        </div>

        <Button
          onClick={createLead}
        >
          Add Lead
        </Button>

      </Card>

      {/* FILTER */}
      <Card className="p-4">

        <div className="flex flex-wrap gap-3">

          <Input
            className="w-[280px]"
            placeholder="Search name, email, phone..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

          <Select
            value={statusFilter}
            onValueChange={
              setStatusFilter
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="ALL">
                All Status
              </SelectItem>

              <SelectItem value="NEW">
                New
              </SelectItem>

              <SelectItem value="CONTACTED">
                Contacted
              </SelectItem>

              <SelectItem value="WON">
                Won
              </SelectItem>

              <SelectItem value="LOST">
                Lost
              </SelectItem>
            </SelectContent>

          </Select>

        </div>

      </Card>

      {/* SUMMARY */}
      <div className="grid md:grid-cols-4 gap-4">

        <Card className="p-5">
          <p className="text-sm text-muted-foreground">
            Total Leads
          </p>

          <h2 className="text-3xl font-bold">
            {leads.length}
          </h2>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-muted-foreground">
            New
          </p>

          <h2 className="text-3xl font-bold">
            {
              leads.filter(
                (x) =>
                  x.status ===
                  "NEW"
              ).length
            }
          </h2>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-muted-foreground">
            Contacted
          </p>

          <h2 className="text-3xl font-bold">
            {
              leads.filter(
                (x) =>
                  x.status ===
                  "CONTACTED"
              ).length
            }
          </h2>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-muted-foreground">
            Won
          </p>

          <h2 className="text-3xl font-bold">
            {
              leads.filter(
                (x) =>
                  x.status ===
                  "WON"
              ).length
            }
          </h2>
        </Card>

      </div>

      {/* TABLE */}
      <Card className="p-6">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="border-b">

                <th className="text-left py-3">
                  Name
                </th>

                <th className="text-left py-3">
                  Email
                </th>

                <th className="text-left py-3">
                  Phone
                </th>

                <th className="text-left py-3">
                  Source
                </th>

                <th className="text-left py-3">
                  Status
                </th>

                <th className="text-left py-3">
                  Created
                </th>

                <th className="text-left py-3">
                  Updated
                </th>

                <th className="text-left py-3">
                  Action
                </th>

                <th className="text-left py-3">
                  View
                </th>
              </tr>

            </thead>

            <tbody>

              {filteredLeads.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No leads found
                  </td>
                </tr>
              ) : (
                filteredLeads.map(
                  (lead) => (
                    <tr
                      key={lead.id}
                      className="border-b"
                    >

                      <td className="py-4 font-medium">
                        {lead.name}
                      </td>

                      <td>
                        {lead.email ??
                          "-"}
                      </td>

                      <td>
                        {lead.phone ??
                          "-"}
                      </td>

                      <td>
                        {lead.source ??
                          "-"}
                      </td>

                      <td>
                        <Badge>
                          {
                            lead.status
                          }
                        </Badge>
                      </td>

                      <td className="text-sm">
                        {new Date(
                          lead.createdAt
                        ).toLocaleDateString()}
                      </td>

                      <td className="text-sm">
                        {new Date(
                          lead.updatedAt
                        ).toLocaleDateString()}
                      </td>

                      <td>

                        <Select
                          value={
                            lead.status
                          }
                          onValueChange={(
                            value
                          ) =>
                            updateStatus(
                              lead.id,
                              value
                            )
                          }
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue />
                          </SelectTrigger>

                          <SelectContent>

                            <SelectItem value="NEW">
                              NEW
                            </SelectItem>

                            <SelectItem value="CONTACTED">
                              CONTACTED
                            </SelectItem>

                            <SelectItem value="WON">
                              WON
                            </SelectItem>

                            <SelectItem value="LOST">
                              LOST
                            </SelectItem>

                          </SelectContent>

                        </Select>

                      </td>

                      <td>

                        <Link
                          href={`/portal/crm/lead/${lead.id}`}
                        >
                          <Button
                            size="sm"
                            variant="outline"
                          >
                            View
                          </Button>
                        </Link>

                    </td>

                    </tr>
                  )
                )
              )}

            </tbody>

          </table>

        </div>

      </Card>

    </div>
  );
}