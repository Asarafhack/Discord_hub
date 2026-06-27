import { createFileRoute } from "@tanstack/react-router";
import { Card, CardHeader, PageHeader } from "@/components/app-shell";
import { auditLog } from "@/lib/mock";
import { Clock, Download } from "lucide-react";

export const Route = createFileRoute("/app/audit")({
  head: () => ({ meta: [{ title: "Audit Log — Command Center" }] }),
  component: Audit,
});

function Audit() {
  return (
    <div>
      <PageHeader
        title="Audit Log"
        description="Append-only ledger of every administrative action across the platform."
        actions={<button className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs hover:bg-accent/10"><Download className="h-3.5 w-3.5" /> Export</button>}
      />

      <Card>
        <CardHeader title="Recent events" description={`${auditLog.length} entries`} />
        <div className="relative px-5 py-4">
          <div className="absolute bottom-4 left-9 top-4 w-px bg-border" />
          <ol className="space-y-4">
            {auditLog.map((a) => (
              <li key={a.id} className="relative pl-10">
                <span className="absolute left-7 top-1.5 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-background bg-primary" />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-sm font-medium">{a.actor}</span>
                    <span className="text-sm text-muted-foreground"> · {a.action}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> {new Date(a.time).toLocaleString()}</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full border border-border bg-background px-2 py-0.5">{a.target}</span>
                  <span className="font-mono">{a.ip}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Card>
    </div>
  );
}
