import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader } from "@/components/app-shell";
import { slashCommands } from "@/lib/mock";
import { useState } from "react";
import { Plus, Settings2, Trash2, Webhook } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/commands")({
  head: () => ({ meta: [{ title: "Slash Commands — Command Center" }] }),
  component: Commands,
});

function Commands() {
  const [items, setItems] = useState(slashCommands);
  const [editing, setEditing] = useState<number | null>(null);

  function toggle(i: number) {
    setItems((prev) => prev.map((c, j) => (j === i ? { ...c, enabled: !c.enabled } : c)));
    toast.success("Command status updated");
  }

  return (
    <div>
      <PageHeader
        title="Slash Commands"
        description="Register, configure and monitor every slash command across guilds."
        actions={<button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90"><Plus className="h-3.5 w-3.5" /> New command</button>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((c, i) => (
          <Card key={c.name} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono text-lg text-accent">{c.name}</div>
                <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" checked={c.enabled} onChange={() => toggle(i)} />
                <div className="h-5 w-9 rounded-full bg-muted peer-checked:bg-primary transition" />
                <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-background transition peer-checked:translate-x-4" />
              </label>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <Meta label="Permission" value={c.permission} />
              <Meta label="Cooldown" value={`${c.cooldownSec}s`} />
              <Meta label="Status" value={c.enabled ? "Registered" : "Disabled"} />
            </div>
            <div className="mt-4 rounded-lg border border-border bg-background/40 p-3 font-mono text-xs text-muted-foreground">
              {c.template}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Webhook className="h-3.5 w-3.5" /> auto-response
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(i)} className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs hover:bg-accent/10"><Settings2 className="h-3.5 w-3.5" /> Edit</button>
                <button className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {editing !== null && (
        <Drawer onClose={() => setEditing(null)} cmd={items[editing]} onSave={(c) => { setItems((prev) => prev.map((p, j) => (j === editing ? c : p))); setEditing(null); toast.success("Command updated"); }} />
      )}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background/40 px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-xs font-medium">{value}</div>
    </div>
  );
}

function Drawer({ onClose, cmd, onSave }: { onClose: () => void; cmd: typeof slashCommands[number]; onSave: (c: typeof slashCommands[number]) => void }) {
  const [draft, setDraft] = useState(cmd);
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-background/70 backdrop-blur" onClick={onClose}>
      <div className="w-full max-w-md overflow-y-auto border-l border-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-lg text-accent">{draft.name}</h2>
          <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground">Close</button>
        </div>
        <div className="mt-6 space-y-4">
          <Input label="Description" value={draft.description} onChange={(v) => setDraft({ ...draft, description: v })} />
          <Select label="Permission" value={draft.permission} options={["Everyone","Member","Moderator","Admin"]} onChange={(v) => setDraft({ ...draft, permission: v })} />
          <Input label="Cooldown (seconds)" type="number" value={String(draft.cooldownSec)} onChange={(v) => setDraft({ ...draft, cooldownSec: Number(v) || 0 })} />
          <div>
            <label className="text-xs font-medium text-muted-foreground">Response template</label>
            <textarea value={draft.template} onChange={(e) => setDraft({ ...draft, template: e.target.value })} rows={4} className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs outline-none focus:border-primary" />
          </div>
          <Input label="Webhook target" value="https://hooks.atlas.dev/incoming/abc" onChange={() => {}} />
          <Select label="Retry policy" value="Exponential x3" options={["None","Linear x3","Exponential x3","Exponential x5"]} onChange={() => {}} />
          <Select label="Priority" value="Normal" options={["Low","Normal","High","Critical"]} onChange={() => {}} />
          <Select label="Category" value="Operations" options={["Operations","Support","Moderation","Analytics"]} onChange={() => {}} />
          <label className="flex items-center justify-between text-sm">
            Auto response
            <input type="checkbox" defaultChecked className="accent-primary" />
          </label>
          <label className="flex items-center justify-between text-sm">
            Notify on failure
            <input type="checkbox" defaultChecked className="accent-primary" />
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-accent/10">Cancel</button>
          <button onClick={() => onSave(draft)} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Save changes</button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input type={type ?? "text"} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
    </label>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
}
