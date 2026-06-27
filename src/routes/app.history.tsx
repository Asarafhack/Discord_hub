import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader, StatusBadge } from "@/components/app-shell";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/history")({
  head: () => ({ meta: [{ title: "Command History — Command Center" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const perPage = 15;

  const { data, refetch } = useQuery({
    queryKey: ["interactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("interactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data;
    },
  });

  // Live updates
  useEffect(() => {
    const ch = supabase
      .channel("interactions-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "interactions" }, () => refetch())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [refetch]);

  const rows = data ?? [];

  const filtered = useMemo(() => {
    return rows.filter((c) => {
      const t = `${c.command_name} ${c.user_tag ?? ""} ${c.command_text ?? ""} ${c.ai_tag ?? ""}`.toLowerCase();
      return t.includes(q.toLowerCase()) && (status === "all" || c.status === status);
    });
  }, [rows, q, status]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const slice = filtered.slice((page - 1) * perPage, page * perPage);

  function exportData(kind: "csv" | "json") {
    let blob: Blob;
    if (kind === "json") blob = new Blob([JSON.stringify(filtered, null, 2)], { type: "application/json" });
    else {
      const head = Object.keys(filtered[0] ?? {}).join(",");
      const body = filtered.map((r) => Object.values(r).map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
      blob = new Blob([head + "\n" + body], { type: "text/csv" });
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `command-history.${kind}`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} rows as ${kind.toUpperCase()}`);
  }

  return (
    <div>
      <PageHeader
        title="Command History"
        description="Every interaction the bot has received — live."
        actions={
          <>
            <button onClick={() => exportData("csv")} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs hover:bg-accent/10"><Download className="h-3.5 w-3.5" /> CSV</button>
            <button onClick={() => exportData("json")} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs hover:bg-accent/10"><Download className="h-3.5 w-3.5" /> JSON</button>
          </>
        }
      />

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-md border border-input bg-background px-3 py-2 min-w-[220px]">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search by command, user, text, AI tag…" className="w-full bg-transparent text-sm outline-none" />
          </div>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="all">All status</option>
            <option value="success">Success</option>
            <option value="disabled">Disabled</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-3">Command</th>
                <th className="py-2 pr-3">User</th>
                <th className="py-2 pr-3">Text</th>
                <th className="py-2 pr-3">Time</th>
                <th className="py-2 pr-3">Mirror</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">AI</th>
              </tr>
            </thead>
            <tbody>
              {slice.map((c) => (
                <tr key={c.id} className="border-b border-border/60 hover:bg-accent/5">
                  <td className="py-3 pr-3 font-mono text-xs text-accent">/{c.command_name}</td>
                  <td className="py-3 pr-3 text-xs">{c.user_tag ?? "—"}</td>
                  <td className="py-3 pr-3 text-xs max-w-[280px] truncate">{c.command_text ?? "—"}</td>
                  <td className="py-3 pr-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(c.created_at).toLocaleString()}</td>
                  <td className="py-3 pr-3 text-xs">{c.mirrored ? "✓" : "—"}</td>
                  <td className="py-3 pr-3"><StatusBadge status={c.status === "success" ? "operational" : "degraded"} /></td>
                  <td className="py-3 pr-3">
                    {c.ai_tag ? (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Sparkles className="h-3 w-3 text-accent" /> {c.ai_tag} — {(c.ai_summary ?? "").slice(0, 40)}</span>
                    ) : <span className="text-xs text-muted-foreground">—</span>}
                  </td>
                </tr>
              ))}
              {slice.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center text-sm text-muted-foreground">No interactions yet. Run a slash command in your Discord server.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}</span>
          <div className="flex items-center gap-2">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="rounded-md border border-border p-1 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
            <span>Page {page} of {pages}</span>
            <button disabled={page === pages} onClick={() => setPage((p) => p + 1)} className="rounded-md border border-border p-1 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </Card>
    </div>
  );
}
