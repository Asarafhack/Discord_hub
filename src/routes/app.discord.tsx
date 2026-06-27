import { createFileRoute } from "@tanstack/react-router";
import { Card, CardHeader, PageHeader } from "@/components/app-shell";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Bot, CheckCircle2, Hash, Plug, Radio, RefreshCw, Save, Webhook } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/discord")({
  head: () => ({ meta: [{ title: "Discord Integration — Command Center" }] }),
  component: Discord,
});

const PROJECT_ID = "41dea4c0-1d1a-44e8-a6d9-e2a12634f06a";
const INTERACTIONS_URL = `https://project--${PROJECT_ID}.lovable.app/api/public/discord/interactions`;

function Discord() {
  const qc = useQueryClient();
  const { data: guilds } = useQuery({
    queryKey: ["guild_configs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("guild_configs").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const [form, setForm] = useState({ guild_id: "", guild_name: "", primary_channel_id: "", mirror_webhook_url: "" });
  useEffect(() => {
    if (guilds && guilds[0] && !form.guild_id) {
      setForm({
        guild_id: guilds[0].guild_id,
        guild_name: guilds[0].guild_name ?? "",
        primary_channel_id: guilds[0].primary_channel_id ?? "",
        mirror_webhook_url: guilds[0].mirror_webhook_url ?? "",
      });
    }
  }, [guilds]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = useMutation({
    mutationFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");
      const { error } = await supabase.from("guild_configs").upsert({
        owner_id: u.user.id,
        guild_id: form.guild_id,
        guild_name: form.guild_name,
        primary_channel_id: form.primary_channel_id || null,
        mirror_webhook_url: form.mirror_webhook_url || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: "owner_id,guild_id" });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Guild config saved"); qc.invalidateQueries({ queryKey: ["guild_configs"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const register = useMutation({
    mutationFn: async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Not signed in");
      const r = await fetch("/api/public/discord/register-commands", {
        method: "POST",
        headers: { authorization: `Bearer ${token}` },
      });
      const body = await r.text();
      if (!r.ok) throw new Error(body || `HTTP ${r.status}`);
      return JSON.parse(body);
    },
    onSuccess: (d) => toast.success(`Registered ${d.registered} command${d.registered === 1 ? "" : "s"} with Discord`),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader title="Discord Integration" description="Connect your Discord application and register slash commands." />

      <div className="grid gap-4 md:grid-cols-4">
        <Status icon={Bot} label="Bot status" value="Configured" tone="success" />
        <Status icon={Plug} label="Interactions endpoint" value="Public" tone="success" />
        <Status icon={Webhook} label="Mirror webhook" value={form.mirror_webhook_url ? "Set" : "Not set"} tone={form.mirror_webhook_url ? "success" : "warning"} />
        <Status icon={Radio} label="Verification" value="Ed25519" tone="info" />
      </div>

      <Card className="mt-6">
        <CardHeader title="Discord Developer Portal setup" description="One-time wiring on the Discord side" />
        <div className="space-y-3 p-5 text-sm">
          <Row icon={Plug} label="Interactions endpoint URL" value={INTERACTIONS_URL} copy />
          <p className="text-xs text-muted-foreground">
            Paste this URL into your Discord application&apos;s <span className="font-mono">Interactions Endpoint URL</span> field.
            Discord will send a signed PING and only save the URL if your endpoint replies correctly. Then click <span className="font-mono">Register slash commands</span> below.
          </p>
        </div>
      </Card>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Connected guild" description="Where the bot will post and listen" />
          <div className="grid gap-3 p-5">
            <Input label="Guild (server) ID" value={form.guild_id} onChange={(v) => setForm({ ...form, guild_id: v })} placeholder="123456789012345678" />
            <Input label="Guild name" value={form.guild_name} onChange={(v) => setForm({ ...form, guild_name: v })} placeholder="My Workspace" />
            <Input label="Primary channel ID" value={form.primary_channel_id} onChange={(v) => setForm({ ...form, primary_channel_id: v })} placeholder="channel for replies" />
            <Input label="Mirror webhook URL (Slack or Discord)" value={form.mirror_webhook_url} onChange={(v) => setForm({ ...form, mirror_webhook_url: v })} placeholder="https://hooks.slack.com/..." />
            <p className="text-xs text-muted-foreground">A default mirror webhook is also configured via server env; per-guild value overrides it in future versions.</p>
            <button onClick={() => save.mutate()} disabled={save.isPending || !form.guild_id} className="mt-2 inline-flex w-fit items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
              <Save className="h-4 w-4" /> Save guild
            </button>
          </div>
        </Card>

        <Card>
          <CardHeader title="Slash commands" description="Push the current command set to Discord" action={
            <button onClick={() => register.mutate()} disabled={register.isPending} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs hover:bg-accent/10 disabled:opacity-60">
              <RefreshCw className={`h-3.5 w-3.5 ${register.isPending ? "animate-spin" : ""}`} /> Register slash commands
            </button>
          } />
          <div className="space-y-2 p-5 text-sm">
            <div className="rounded-lg border border-success/30 bg-success/10 p-3 text-xs text-success">
              <CheckCircle2 className="mb-1 inline h-3.5 w-3.5" /> Endpoint verifies every request with Ed25519. PINGs answered automatically. Duplicate interactions are deduped by interaction id.
            </div>
            <div className="rounded-lg border border-border bg-background/40 p-3 text-xs">
              <div className="mb-1 font-medium">What gets registered</div>
              All enabled rows from <span className="font-mono">slash_commands</span>. <span className="font-mono">/report</span> is registered with a required <span className="font-mono">text</span> option.
            </div>
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Saved guilds" />
        <div className="divide-y divide-border">
          {(guilds ?? []).map((g) => (
            <div key={g.id} className="flex items-center justify-between px-5 py-3.5 text-sm">
              <div>
                <div className="font-medium">{g.guild_name || g.guild_id}</div>
                <div className="text-xs text-muted-foreground font-mono">{g.guild_id}</div>
              </div>
              <div className="text-xs text-muted-foreground">{g.mirror_webhook_url ? "mirror configured" : "no mirror"}</div>
            </div>
          ))}
          {(!guilds || guilds.length === 0) && <div className="p-5 text-sm text-muted-foreground">No guilds connected yet.</div>}
        </div>
      </Card>
    </div>
  );
}

function Status({ icon: Icon, label, value, tone }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; tone: "success" | "warning" | "info" }) {
  const c = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-info";
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5" /> {label}</div>
      <div className={`mt-2 text-xl font-semibold ${c}`}>{value}</div>
    </div>
  );
}

function Row({ icon: Icon, label, value, copy }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; copy?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-background/40 px-3 py-2 text-xs">
      <span className="flex items-center gap-2 text-muted-foreground"><Icon className="h-3.5 w-3.5" /> {label}</span>
      <span className="flex items-center gap-2">
        <span className="font-mono break-all">{value}</span>
        {copy && <button onClick={() => { navigator.clipboard.writeText(value); toast.success("Copied"); }} className="rounded border border-border px-2 py-0.5 text-[10px] hover:bg-accent/10">copy</button>}
      </span>
    </div>
  );
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
    </label>
  );
}
