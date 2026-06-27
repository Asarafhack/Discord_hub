import { createFileRoute } from "@tanstack/react-router";
import { Card, CardHeader, PageHeader, StatusBadge } from "@/components/app-shell";
import { notifications } from "@/lib/mock";
import { useState } from "react";
import { Bell, CheckCheck, RotateCcw, X } from "lucide-react";

export const Route = createFileRoute("/app/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Command Center" }] }),
  component: Notifs,
});

function Notifs() {
  const [items, setItems] = useState(notifications);
  const unread = items.filter((n) => n.unread).length;

  return (
    <div>
      <PageHeader
        title="Notifications"
        description={`${unread} unread alerts across webhook deliveries and system events.`}
        actions={<button onClick={() => setItems((p) => p.map((n) => ({ ...n, unread: false })))} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs hover:bg-accent/10"><CheckCheck className="h-3.5 w-3.5" /> Mark all read</button>}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Tile label="Unread" value={String(unread)} />
        <Tile label="Webhook deliveries" value="12,401" />
        <Tile label="Retry queue" value="14" />
        <Tile label="Dead-letter" value="2" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Recent activity" />
          <div className="divide-y divide-border">
            {items.map((n) => (
              <div key={n.id} className={`flex items-start gap-3 px-5 py-3.5 ${n.unread ? "bg-primary/5" : ""}`}>
                <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${n.kind === "success" ? "bg-success" : n.kind === "warning" ? "bg-warning" : n.kind === "danger" ? "bg-destructive" : "bg-info"}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{n.title}</span>
                    <span className="text-[10px] text-muted-foreground">{n.time}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                </div>
                <button onClick={() => setItems((p) => p.filter((x) => x.id !== n.id))} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Queue title="Success queue" count={1284} desc="Delivered in the last 24h" status="operational" />
          <Queue title="Retry queue" count={14} desc="Pending with exponential backoff" status="degraded" action="Replay all" />
          <Queue title="Failure queue" count={2} desc="Dead-letter — manual review" status="failed" />
        </div>
      </div>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Bell className="h-3.5 w-3.5" /> {label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </Card>
  );
}

function Queue({ title, count, desc, status, action }: { title: string; count: number; desc: string; status: string; action?: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{title}</span>
        <StatusBadge status={status} />
      </div>
      <div className="mt-2 text-3xl font-semibold">{count}</div>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
      {action && (
        <button className="mt-3 inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs hover:bg-accent/10">
          <RotateCcw className="h-3.5 w-3.5" /> {action}
        </button>
      )}
    </Card>
  );
}
