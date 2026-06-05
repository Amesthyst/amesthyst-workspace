"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function CRMPage() {
  const { user, loading } = useAuth();

  const [leads, setLeads] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  async function loadLeads() {
    if (!user?.companyId) return;

    const res = await fetch(
      `/api/crm/leads?companyId=${user.companyId}`
    );

    const data = await res.json();
    setLeads(data);
  }

  async function createLead() {
    await fetch("/api/crm/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId: user.companyId,
        name,
        email,
      }),
    });

    setName("");
    setEmail("");
    loadLeads();
  }

  async function updateStatus(leadId: string, status: string) {
    await fetch("/api/crm/leads/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, status }),
    });

    loadLeads();
  }

  useEffect(() => {
    if (user?.companyId) loadLeads();
  }, [user]);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading CRM...</div>;
  }

  const filteredLeads = leads
    .filter((lead) =>
      lead.name.toLowerCase().includes(search.toLowerCase())
    )
    .filter((lead) =>
      statusFilter === "ALL"
        ? true
        : lead.status === statusFilter
    );

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">
          CRM - Leads
        </h1>
        <p className="text-gray-500 text-sm">
          Manage your sales pipeline
        </p>
      </div>

      {/* CREATE LEAD */}
      <Card className="p-4 space-y-3">
        <h2 className="font-semibold">Create Lead</h2>

        <Input
          placeholder="Lead Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button onClick={createLead}>
          Add Lead
        </Button>
      </Card>

      {/* FILTER BAR */}
      <Card className="p-4">
      <div className="flex flex-wrap items-center justify-start gap-3">

        <Input
          className="w-[250px]"
          placeholder="Search leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="NEW">New</SelectItem>
            <SelectItem value="CONTACTED">Contacted</SelectItem>
            <SelectItem value="WON">Won</SelectItem>
            <SelectItem value="LOST">Lost</SelectItem>
          </SelectContent>
        </Select>

      </div>
    </Card>

      {/* TABLE */}
      <Card className="p-4">
        <div className="grid grid-cols-4 text-sm text-gray-500 mb-3">
          <p>Name</p>
          <p>Email</p>
          <p>Status</p>
          <p>Action</p>
        </div>

        {filteredLeads.map((lead) => (
          <div
            key={lead.id}
            className="grid grid-cols-4 items-center py-3 border-t"
          >
            <p className="font-medium">{lead.name}</p>

            <p className="text-sm text-gray-500">
              {lead.email}
            </p>

            <Badge>{lead.status}</Badge>

            <Select
              value={lead.status}
              onValueChange={(value: string) =>
                updateStatus(lead.id, value)
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="NEW">NEW</SelectItem>
                <SelectItem value="CONTACTED">CONTACTED</SelectItem>
                <SelectItem value="WON">WON</SelectItem>
                <SelectItem value="LOST">LOST</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ))}
      </Card>

    </div>
  );
}