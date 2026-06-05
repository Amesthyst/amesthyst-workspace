"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Lead = {
  id: string;
  name: string;
  email: string | null;
};

type Activity = {
  id: string;
  type: string;
  description: string;
  createdAt: string;
};

const TYPE_COLORS: Record<string, string> = {
  CALL: "bg-blue-100 text-blue-700",
  EMAIL: "bg-green-100 text-green-700",
  MEETING: "bg-purple-100 text-purple-700",
};

export default function ActivitiesPage() {
  const { user } = useAuth();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");

  const [selectedLead, setSelectedLead] =
    useState<Lead | null>(null);

  const [activities, setActivities] = useState<Activity[]>([]);

  const [type, setType] = useState("CALL");
  const [description, setDescription] = useState("");

  const [filterType, setFilterType] = useState("ALL");
  const [onlyToday, setOnlyToday] = useState(false);

  // ---------------------------
  // LOAD LEADS
  // ---------------------------
  async function loadLeads() {
    if (!user?.companyId) return;

    const res = await fetch(
      `/api/crm/leads?companyId=${user.companyId}`
    );

    const data = await res.json();
    setLeads(data);
  }

  // ---------------------------
  // LOAD ACTIVITIES
  // ---------------------------
  async function loadActivities(leadId: string) {
    const res = await fetch(
      `/api/crm/activities?leadId=${leadId}`
    );

    const data = await res.json();
    setActivities(data);
  }

  // ---------------------------
  // CREATE ACTIVITY
  // ---------------------------
  async function createActivity() {
    if (!selectedLead) return;

    await fetch("/api/crm/activities", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        leadId: selectedLead.id,
        type,
        description,
      }),
    });

    setDescription("");
    loadActivities(selectedLead.id);
  }

  useEffect(() => {
    loadLeads();

    // CMD + K shortcut
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        const first = leads[0];
        if (first) {
          setSelectedLead(first);
          loadActivities(first.id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () =>
      window.removeEventListener("keydown", handleKeyDown);
  }, [user, leads]);

  // ---------------------------
  // SEARCH FILTER (debounced logic)
  // ---------------------------
  const filteredLeads = useMemo(() => {
    const q = search.toLowerCase();

    return leads.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q)
    );
  }, [leads, search]);

  // ---------------------------
  // ACTIVITY FILTERS
  // ---------------------------
  const filteredActivities = useMemo(() => {
    return activities.filter((a) => {
      const matchType =
        filterType === "ALL" || a.type === filterType;

      const matchToday = onlyToday
        ? new Date(a.createdAt).toDateString() ===
          new Date().toDateString()
        : true;

      return matchType && matchToday;
    });
  }, [activities, filterType, onlyToday]);

  return (
    <div className="h-full flex gap-4">

      {/* LEFT PANEL */}
      <div className="w-80 border-r pr-4 space-y-3">

        <h2 className="font-bold text-lg">
          Leads
        </h2>

        <Input
          placeholder="Search (Ctrl + K for quick open)"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <div className="space-y-2 max-h-[75vh] overflow-auto">
          {filteredLeads.map((lead) => (
            <Card
              key={lead.id}
              onClick={() => {
                setSelectedLead(lead);
                loadActivities(lead.id);
              }}
              className={`
                p-3 cursor-pointer transition
                hover:shadow-md
                ${
                  selectedLead?.id === lead.id
                    ? "border-primary"
                    : ""
                }
              `}
            >
              <p className="font-medium">
                {lead.name}
              </p>

              <p className="text-xs text-muted-foreground">
                {lead.email}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 space-y-6">

        {!selectedLead ? (
          <div className="text-muted-foreground">
            Select a lead or press Ctrl + K
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="border-b pb-3">
              <h1 className="text-2xl font-bold">
                {selectedLead.name}
              </h1>

              <p className="text-sm text-muted-foreground">
                {selectedLead.email}
              </p>
            </div>

            {/* FILTER BAR */}
            <div className="flex gap-2 flex-wrap">

              {["ALL", "CALL", "EMAIL", "MEETING"].map(
                (t) => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`
                      px-3 py-1 text-xs rounded-full border
                      ${
                        filterType === t
                          ? "bg-black text-white"
                          : ""
                      }
                    `}
                  >
                    {t}
                  </button>
                )
              )}

              <button
                onClick={() =>
                  setOnlyToday(!onlyToday)
                }
                className={`
                  px-3 py-1 text-xs rounded-full border
                  ${
                    onlyToday
                      ? "bg-black text-white"
                      : ""
                  }
                `}
              >
                Today
              </button>
            </div>

            {/* CREATE ACTIVITY */}
            <Card className="p-4 space-y-3 max-w-md">
              <Input
                placeholder="Type (CALL / EMAIL / MEETING)"
                value={type}
                onChange={(e) =>
                  setType(e.target.value)
                }
              />

              <Input
                placeholder="Description..."
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
              />

              <Button onClick={createActivity}>
                Add Activity
              </Button>
            </Card>

            {/* TIMELINE */}
            <div className="space-y-3">

              {filteredActivities.length === 0 ? (
                <div className="text-muted-foreground">
                  No activities found for this filter
                </div>
              ) : (
                filteredActivities.map((a) => (
                  <Card key={a.id} className="p-4">
                    <div className="flex justify-between items-center">

                      <span
                        className={`
                          text-xs px-2 py-1 rounded-full
                          ${TYPE_COLORS[a.type] || "bg-gray-100"}
                        `}
                      >
                        {a.type}
                      </span>

                      <span className="text-xs text-muted-foreground">
                        {new Date(
                          a.createdAt
                        ).toLocaleString()}
                      </span>
                    </div>

                    <p className="mt-2 text-sm">
                      {a.description}
                    </p>
                  </Card>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}