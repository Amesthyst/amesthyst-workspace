"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Contact = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
};

export default function ContactsPage() {
  const { user } = useAuth();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");

  async function loadContacts() {
    if (!user?.companyId) return;

    const res = await fetch(
      `/api/crm/contacts?companyId=${user.companyId}`
    );

    const data = await res.json();

    setContacts(data);
  }

  useEffect(() => {
    loadContacts();

    const handler = () => {
      loadContacts();
    };

    window.addEventListener(
      "contacts-updated",
      handler
    );

    return () => {
      window.removeEventListener(
        "contacts-updated",
        handler
      );
    };
  }, [user]);

  const filtered = contacts.filter((contact) => {
    const q = search.toLowerCase();

    return (
      contact.name.toLowerCase().includes(q) ||
      contact.email?.toLowerCase().includes(q) ||
      contact.phone?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Contacts
        </h1>

        <p className="text-muted-foreground">
          Customer database from converted leads
        </p>
      </div>

      <div className="max-w-md">
        <Input
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />
      </div>

      <div className="grid gap-4">

        {filtered.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            No contacts found
          </Card>
        ) : (
          filtered.map((contact) => (
            <Card
              key={contact.id}
              className="
                p-4
                hover:shadow-md
                transition
              "
            >
              <h3 className="font-semibold text-lg">
                {contact.name}
              </h3>

              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                <p>
                  📧 {contact.email ?? "No email"}
                </p>

                <p>
                  📞 {contact.phone ?? "No phone"}
                </p>
              </div>
            </Card>
          ))
        )}

      </div>
    </div>
  );
}