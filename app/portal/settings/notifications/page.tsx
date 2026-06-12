"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

type Notification = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);

      const res = await fetch("/api/notifications/list");
      const data = await res.json();

      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function markAsRead(id: string) {
    await fetch(`/api/notifications/${id}`, {
      method: "PATCH",
    });

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      )
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-4 p-4">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">
          Notification Center
        </h1>

        <p className="text-sm text-gray-500">
          {unreadCount} unread notifications
        </p>
      </div>

      {/* EMPTY STATE */}
      {!loading && notifications.length === 0 && (
        <Card className="p-6 text-center text-gray-500">
          No notifications yet
        </Card>
      )}

      {/* LOADING */}
      {loading && (
        <Card className="p-4 text-center">
          Loading notifications...
        </Card>
      )}

      {/* LIST */}
      <div className="space-y-3">
        {notifications.map((n) => (
          <Card
            key={n.id}
            className={`p-4 space-y-2 transition ${
              n.isRead ? "opacity-60" : "border-blue-400"
            }`}
          >
            <div className="flex justify-between">
              <p className="font-semibold">
                {n.title}
              </p>

              {!n.isRead && (
                <button
                  onClick={() => markAsRead(n.id)}
                  className="text-blue-500 text-sm"
                >
                  Mark as read
                </button>
              )}
            </div>

            <p className="text-sm text-gray-600">
              {n.message}
            </p>

            <p className="text-xs text-gray-400">
              {new Date(n.createdAt).toLocaleString()}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}