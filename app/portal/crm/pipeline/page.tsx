"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/lib/context/AuthContext";

import LeadCard from "@/components/crm/LeadCard";
import LeadDetailsDialog from "@/components/crm/LeadDetailsDialog";

const STATUSES = [
  "NEW",
  "CONTACTED",
  "WON",
  "LOST",
];

type Lead = {
  id: string;
  name: string;
  email: string | null;
  status: string;
};

export default function PipelinePage() {
  const { user } = useAuth();

  const [leads, setLeads] = useState<Lead[]>([]);

  const [selectedLead, setSelectedLead] =
    useState<Lead | null>(null);

  const [dialogOpen, setDialogOpen] =
    useState(false);

  async function loadLeads() {
    if (!user?.companyId) return;

    const res = await fetch(
      `/api/crm/leads?companyId=${user.companyId}`
    );

    const data = await res.json();

    setLeads(data);
  }

  async function updateStatus(
    leadId: string,
    status: string
  ) {
    await fetch("/api/crm/leads/status", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        leadId,
        status,
      }),
    });

    await loadLeads();
  }

  useEffect(() => {
    loadLeads();
  }, [user]);

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          CRM Pipeline
        </h1>

        <p className="text-muted-foreground">
          Manage your sales funnel.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

        {STATUSES.map((status) => (
          <div
            key={status}
            className="rounded-xl bg-muted p-4"
          >
            <div className="mb-4">
              <h2 className="font-semibold">
                {status}
              </h2>

              <p className="text-xs text-muted-foreground">
                {
                  leads.filter(
                    (lead) => lead.status === status
                  ).length
                }{" "}
                Leads
              </p>
            </div>

            <div className="space-y-3">

              {leads
                .filter(
                  (lead) => lead.status === status
                )
                .map((lead) => (
                  <div key={lead.id}>
                    <LeadCard
                    lead={lead}
                    onClick={() => {
                        setSelectedLead(lead);
                        setDialogOpen(true);
                    }}
                    onConvert={async (leadId) => {
                        const res = await fetch(
                        "/api/crm/leads/convert",
                        {
                            method: "POST",
                            headers: {
                            "Content-Type":
                                "application/json",
                            },
                            body: JSON.stringify({
                            leadId,
                            }),
                        }
                        );

                        const data = await res.json();

                        if (!res.ok) {
                        alert(data.error);
                        return;
                        }

                        alert(
                        "Lead converted successfully"
                        );
                        window.dispatchEvent(new Event("contacts-updated"));

                        await loadLeads();
                    }}
                    />

                    <div className="flex flex-wrap gap-1 mt-2">
                      {STATUSES.map((nextStatus) => (
                        <button
                          key={nextStatus}
                          onClick={() =>
                            updateStatus(
                              lead.id,
                              nextStatus
                            )
                          }
                          className="
                            text-xs
                            border
                            rounded
                            px-2
                            py-1
                            bg-white
                            hover:bg-gray-100
                          "
                        >
                          {nextStatus}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

            </div>
          </div>
        ))}

      </div>

      <LeadDetailsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        lead={selectedLead}
      />

    </div>
  );
}