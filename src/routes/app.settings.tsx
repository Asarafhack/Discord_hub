import { createFileRoute } from "@tanstack/react-router";
import { Card, CardHeader, PageHeader } from "@/components/app-shell";
import { useState } from "react";
import { AlertTriangle, Copy, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/settings")({
  head: () => ({ meta: [{ title: "Settings — Command Center" }] }),
  component: SettingsPage,
});

const tabs = ["General","Discord","Webhooks","Notifications","AI","Theme","API Keys","Danger Zone"] as const;

function SettingsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("General");
  return (
    <div>
      <PageHeader title="Settings" description="Configure your Command Center workspace." />

      <div className="flex flex-wrap gap-1 border-b border-border">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm border-b-2 transition ${tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{t}</button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "General" && <General />}
        {tab === "Discord" && <DiscordCfg />}
        {tab === "Webhooks" && <Webhooks />}
        {tab === "Notifications" && <Notifs />}
        {tab === "AI" && <AICfg />}
        {tab === "Theme" && <Theme />}
        {tab === "API Keys" && <ApiKeys />}
        {tab === "Danger Zone" && <Danger />}
      </div>
    </div>
  );
}

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader title={title} description={desc} />
      <div className="space-y-4 p-5">{children}</div>
    </Card>
  );
}

function Toggle({ label, desc, defaultOn = true }: { label: string; desc?: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-background/40 p-4">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {desc && <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>}
      </div>
      <button onClick={() => setOn((v) => !v)} className={`relative h-5 w-9 shrink-0 rounded-full transition ${on ? "bg-primary" : "bg-muted"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-background transition ${on ? "left-[18px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

function Input({ label, defaultValue, placeholder }: { label: string; defaultValue?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input defaultValue={defaultValue} placeholder={placeholder} className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
    </label>
  );
}

function General() {
  return (
    <Section title="Organization" desc="Basic information about your workspace.">
      <Input label="Workspace name" defaultValue="Atlas HQ" />
      <Input label="Support email" defaultValue="support@atlas.dev" />
      <Input label="Timezone" defaultValue="UTC" />
      <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Save</button>
    </Section>
  );
}

function DiscordCfg() {
  return (
    <Section title="Discord credentials">
      <Input label="Application ID" defaultValue="9832018470293817" />
      <Input label="Public key" defaultValue="b9f3a1c2…d041" />
      <Input label="Bot token" defaultValue="•••••••••••••" />
      <Toggle label="Auto-register slash commands" desc="Push command updates to Discord whenever a rule changes." />
    </Section>
  );
}

function Webhooks() {
  return (
    <Section title="Outbound webhooks" desc="Endpoints to forward events to.">
      <Input label="Primary URL" defaultValue="https://hooks.atlas.dev/incoming/abc" />
      <Input label="Signing secret" defaultValue="whsec_•••••••" />
      <Toggle label="Retry on failure" desc="Exponential backoff up to 3 attempts." />
      <Toggle label="Dead-letter queue" desc="Capture deliveries that exhaust retries." />
    </Section>
  );
}

function Notifs() {
  return (
    <Section title="Notification preferences">
      <Toggle label="Email — daily report" />
      <Toggle label="Email — webhook failures" />
      <Toggle label="Discord DM — admin sign-in" defaultOn={false} />
      <Toggle label="Slack — incident alerts" defaultOn={false} />
    </Section>
  );
}

function AICfg() {
  return (
    <Section title="AI pipeline">
      <Toggle label="Summarize commands" desc="Generate a short summary for every interaction." />
      <Toggle label="Auto-tagging" />
      <Toggle label="Sentiment & risk scoring" />
      <Input label="Confidence threshold" defaultValue="0.75" />
    </Section>
  );
}

function Theme() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  function apply(t: "dark" | "light") {
    setTheme(t);
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("light", t === "light");
    }
  }
  return (
    <Section title="Appearance">
      <div className="grid gap-3 sm:grid-cols-2">
        {(["dark","light"] as const).map((t) => (
          <button key={t} onClick={() => apply(t)} className={`rounded-xl border p-4 text-left ${theme === t ? "border-primary" : "border-border"}`}>
            <div className="mb-3 h-20 rounded-md" style={{ background: t === "dark" ? "linear-gradient(135deg,#1b1c2e,#0f1020)" : "linear-gradient(135deg,#f5f6fb,#e6e9f5)" }} />
            <div className="text-sm font-medium capitalize">{t}</div>
            <div className="text-xs text-muted-foreground">{t === "dark" ? "Default — recommended for ops" : "Best in bright environments"}</div>
          </button>
        ))}
      </div>
    </Section>
  );
}

function ApiKeys() {
  const [keys, setKeys] = useState([
    { id: "k1", name: "Production", token: "cck_live_1f4a…920c", created: "2024-09-02" },
    { id: "k2", name: "Staging", token: "cck_test_8b21…f01e", created: "2024-08-14" },
  ]);
  return (
    <Section title="API keys" desc="Use these to authenticate requests from your services.">
      <div className="divide-y divide-border rounded-lg border border-border">
        {keys.map((k) => (
          <div key={k.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <div>
              <div className="font-medium">{k.name}</div>
              <div className="font-mono text-xs text-muted-foreground">{k.token}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{k.created}</span>
              <button onClick={() => { navigator.clipboard.writeText(k.token); toast.success("Copied"); }} className="rounded-md border border-border p-1.5 hover:bg-accent/10"><Copy className="h-3.5 w-3.5" /></button>
              <button onClick={() => setKeys((p) => p.filter((x) => x.id !== k.id))} className="rounded-md border border-border p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => setKeys((p) => [...p, { id: `k${Date.now()}`, name: "New key", token: `cck_${Math.random().toString(36).slice(2,10)}…`, created: new Date().toISOString().slice(0,10) }])} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs hover:bg-accent/10"><Plus className="h-3.5 w-3.5" /> Generate new key</button>
    </Section>
  );
}

function Danger() {
  return (
    <Card className="border-destructive/30">
      <CardHeader title="Danger zone" description="Irreversible actions. Proceed carefully." />
      <div className="space-y-3 p-5">
        {[
          { t: "Rotate all API keys", d: "Invalidates every existing key. New keys must be deployed.", b: "Rotate" },
          { t: "Disconnect Discord", d: "Removes the bot from every guild and clears credentials.", b: "Disconnect" },
          { t: "Delete workspace", d: "Permanently delete all data. This cannot be undone.", b: "Delete" },
        ].map((a) => (
          <div key={a.t} className="flex items-start justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium"><AlertTriangle className="h-4 w-4 text-destructive" /> {a.t}</div>
              <p className="mt-1 text-xs text-muted-foreground">{a.d}</p>
            </div>
            <button className="rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:opacity-90">{a.b}</button>
          </div>
        ))}
      </div>
    </Card>
  );
}
