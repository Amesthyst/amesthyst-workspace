"use client";

import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Lead = {
  id: string;
  name: string;
  email: string | null;
  status: string;
};

export default function LeadDetailsDialog({
  open,
  onOpenChange,
  lead,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  lead: Lead | null;
}) {
  const [notes, setNotes] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  const [noteContent, setNoteContent] =
    useState("");

  const [activityContent, setActivityContent] =
    useState("");

  async function loadData() {
    if (!lead) return;

    const notesRes = await fetch(
      `/api/crm/notes?leadId=${lead.id}`
    );

    const activitiesRes = await fetch(
      `/api/crm/activities?leadId=${lead.id}`
    );

    setNotes(await notesRes.json());
    setActivities(await activitiesRes.json());
  }

  async function addNote() {
    if (!lead || !noteContent) return;

    await fetch("/api/crm/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        leadId: lead.id,
        content: noteContent,
      }),
    });

    setNoteContent("");

    loadData();
  }

  async function addActivity() {
    if (!lead || !activityContent) return;

    await fetch("/api/crm/activities", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        leadId: lead.id,
        type: "NOTE",
        description: activityContent,
      }),
    });

    setActivityContent("");

    loadData();
  }

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, lead]);

  if (!lead) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-3xl">

        <DialogHeader>
          <DialogTitle>
            {lead.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">

          <div>
            <p>{lead.email}</p>
            <p>Status: {lead.status}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">
              Notes
            </h3>

            <div className="flex gap-2 mb-3">
              <Input
                value={noteContent}
                onChange={(e) =>
                  setNoteContent(e.target.value)
                }
                placeholder="Add note..."
              />

              <Button onClick={addNote}>
                Add
              </Button>
            </div>

            <div className="space-y-2">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="border rounded p-2"
                >
                  {note.content}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">
              Activities
            </h3>

            <div className="flex gap-2 mb-3">
              <Input
                value={activityContent}
                onChange={(e) =>
                  setActivityContent(
                    e.target.value
                  )
                }
                placeholder="Log activity..."
              />

              <Button onClick={addActivity}>
                Add
              </Button>
            </div>

            <div className="space-y-2">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="border rounded p-2"
                >
                  <p className="font-medium">
                    {activity.type}
                  </p>

                  <p>
                    {activity.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </DialogContent>
    </Dialog>
  );
}