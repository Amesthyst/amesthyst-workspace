"use client";

import { use } from "react";
import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Note = {
  id: string;
  content: string;
  createdAt: string;
};

type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: string | null;
  status: string;
};

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [lead, setLead] =
    useState<Lead | null>(null);

  const [notes, setNotes] =
    useState<Note[]>([]);

  const [content, setContent] =
    useState("");

  async function loadLead() {
    const res = await fetch(
      `/api/crm/leads/${id}`
    );

    const data = await res.json();

    setLead(data);
  }

  async function loadNotes() {
    const res = await fetch(
      `/api/crm/notes?leadId=${id}`
    );

    const data = await res.json();

    setNotes(data);
  }

  async function createNote() {
    if (!content.trim()) return;

    await fetch("/api/crm/notes", {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        leadId: id,
        content,
      }),
    });

    setContent("");

    loadNotes();
  }

  useEffect(() => {
    loadLead();
    loadNotes();
  }, [id]);

  if (!lead) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">

      <Card className="p-6">

        <h1 className="text-2xl font-bold">
          {lead.name}
        </h1>

        <div className="mt-4 space-y-2">

          <p>
            <strong>Email:</strong>{" "}
            {lead.email || "-"}
          </p>

          <p>
            <strong>Phone:</strong>{" "}
            {lead.phone || "-"}
          </p>

          <p>
            <strong>Source:</strong>{" "}
            {lead.source || "-"}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {lead.status}
          </p>

        </div>

      </Card>

      <Card className="p-6">

        <h2 className="font-semibold mb-4">
          Add Note
        </h2>

        <Textarea
          value={content}
          onChange={(e) =>
            setContent(e.target.value)
          }
          placeholder="Write note..."
        />

        <Button
          className="mt-4"
          onClick={createNote}
        >
          Save Note
        </Button>

      </Card>

      <Card className="p-6">

        <h2 className="font-semibold mb-4">
          Notes History
        </h2>

        <div className="space-y-3">

          {notes.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No notes yet
            </p>
          )}

          {notes.map((note) => (

            <div
              key={note.id}
              className="border rounded-lg p-4"
            >

              <p>{note.content}</p>

              <p className="text-xs text-muted-foreground mt-2">
                {new Date(
                  note.createdAt
                ).toLocaleString()}
              </p>

            </div>

          ))}

        </div>

      </Card>

    </div>
  );
}