"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

type AuditLog = {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  createdAt: string;
  user: {
    email: string;
    employee?: {
      name?: string;
    };
  };
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadLogs() {
    try {
      setLoading(true);

      const res = await fetch("/api/audit-log");

      const data = await res.json();

      setLogs(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">
        System Audit Log
      </h1>

      {loading ? (
        <Card className="p-4">Loading...</Card>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <Card key={log.id} className="p-4">
              <div className="font-semibold">
                {log.action}
              </div>

              <div className="text-sm text-gray-500">
                {log.entity} • {log.entityId}
              </div>

              <div className="text-xs text-gray-400">
                {new Date(log.createdAt).toLocaleString()}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}