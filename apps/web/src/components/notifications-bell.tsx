"use client";

import { useState, useEffect } from "react";
import { Bell, X, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui";

interface Notification {
  id: string;
  title: string;
  body: string;
  href?: string | null;
  read: boolean;
  createdAt: string;
}

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id?: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(id ? { notificationId: id } : { readAll: true }),
      });
      if (id) {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } else {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleClick = (n: Notification) => {
    if (!n.read) markAsRead(n.id);
    if (n.href) {
      window.location.href = n.href;
    }
    setOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => { setOpen(!open); if (loading) fetchNotifications(); }}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[rgb(var(--primary))] text-white text-xs flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
      )}

      {open && (
        <div
          className="fixed top-16 right-5 z-50 w-96 max-h-[60vh] bg-[rgb(var(--card))] border border-border rounded-xl shadow-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={() => markAsRead(undefined)}>
                  <CheckCheck className="h-3 w-3 mr-1" /> Mark all read
                </Button>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="max-h-[50vh] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {loading ? "Loading..." : "No notifications yet"}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`w-full p-4 text-left hover:bg-[rgb(var(--accent))/0.02] transition-colors ${
                      !n.read ? "bg-[rgb(var(--primary))/0.03]" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                          !n.read ? "bg-[rgb(var(--primary))]" : "bg-transparent border border-border"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${!n.read ? "" : "text-muted-foreground"}`}>{n.title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{n.body}</p>
                        <p className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                      {!n.read && (
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}>
                          <CheckCheck className="h-3 w-3 text-[rgb(var(--primary))]" />
                        </Button>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}