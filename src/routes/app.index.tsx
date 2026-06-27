import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardHeader, PageHeader, StatusBadge } from "@/components/app-shell";
import { commandHistory, commandsByType, systemHealth, usageSeries } from "@/lib/mock";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Activity, ArrowUpRight, CheckCircle2, Clock, Cpu, Database, MessagesSquare, Webhook, Zap } from "lucide-react";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Overview — Command Center" }] }),
  component: Overview,
});

const COLORS = ["oklch(0.66 0.19 275)", "oklch(0.75 0.15 200)", "oklch(0.72 0.16 160)", "oklch(0.8 0.16 80)", "oklch(0.7 0.2 330)", "oklch(0.6 0.18 250)"];

function Overview() {
  const total = commandHistory.length;
  const successRate = ((commandHistory.filter((c) => c.status === "success").length / total) * 100).toFixed(1);
  const avgLatency = Math.round(commandHistory.reduce((a, c) => a + c.executionMs, 0) / total);

  return (
    <div>
      <PageHeader
        title="Overview"
        description="Real-time pulse across every connected Discord guild, command and webhook."
        actions={
          <>
            <button className="rounded-md border border-border px-3 py-2 text-xs hover:bg-accent/10">Last 7 days</button>
            <button className="rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90">Export report</button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat icon={MessagesSquare} label="Commands today" value="4,218" trend="+12%" trendKind="up" />
        <Stat icon={Zap} label="Avg latency" value={`${avgLatency}ms`} trend="-8ms" trendKind="up" />
        <Stat icon={CheckCircle2} label="Success rate" value={`${successRate}%`} trend="+0.3%" trendKind="up" />
        <Stat icon={Webhook} label="Webhook deliveries" value="12,401" trend="+4.1%" trendKind="up" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Command volume" description="Commands and errors per day, last 14 days" />
          <div className="p-4">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={usageSeries}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS[0]} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={COLORS[0]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(0.3 0.025 260)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="oklch(0.6 0.02 255)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.6 0.02 255)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "oklch(0.22 0.025 260)", border: "1px solid oklch(0.3 0.025 260)", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="commands" stroke={COLORS[0]} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="errors" stroke={COLORS[3]} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="System health" description="Live status of each service" />
          <div className="space-y-2 p-4">
            {systemHealth.map((s) => (
              <div key={s.name} className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-2">
                <div className="flex items-center gap-2">
                  <ServiceIcon name={s.name} />
                  <span className="text-sm">{s.name}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{s.latency}ms</span>
                  <StatusBadge status={s.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Top commands" description="Usage by command name" />
          <div className="p-4">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={commandsByType}>
                <CartesianGrid stroke="oklch(0.3 0.025 260)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="oklch(0.6 0.02 255)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.6 0.02 255)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "oklch(0.22 0.025 260)", border: "1px solid oklch(0.3 0.025 260)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill={COLORS[1]} radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Command distribution" description="Share of total volume" />
          <div className="p-4">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={commandsByType} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {commandsByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Live activity" description="Streaming command feed" action={<span className="text-[10px] text-success">● LIVE</span>} />
          <div className="divide-y divide-border">
            {commandHistory.slice(0, 7).map((c) => (
              <div key={c.id} className="flex items-center justify-between px-4 py-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="font-mono text-accent">{c.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{c.guild}</span>
                  <StatusBadge status={c.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Recent errors" description="Failed and retrying commands" action={<Link to="/app/history" className="text-xs text-primary hover:underline">View all</Link>} />
          <div className="divide-y divide-border">
            {commandHistory.filter((c) => c.status !== "success").slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <div className="font-mono text-xs text-accent">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.user} · {c.guild}</div>
                </div>
                <div className="text-right">
                  <StatusBadge status={c.status} />
                  <div className="mt-1 text-[10px] text-muted-foreground">retry × {c.retryCount}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Server status" description="Connected Discord guilds" action={<Link to="/app/discord" className="text-xs text-primary hover:underline">Manage</Link>} />
          <div className="divide-y divide-border">
            {["Atlas HQ","Nebula Labs","Synthwave","Open Source Guild"].map((g, i) => (
              <div key={g} className="flex items-center justify-between px-4 py-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary text-xs font-bold">{g[0]}</div>
                  <div>
                    <div>{g}</div>
                    <div className="text-xs text-muted-foreground">{240 + i * 312} members</div>
                  </div>
                </div>
                <StatusBadge status={i === 2 ? "degraded" : "healthy"} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, trend, trendKind }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; trend: string; trendKind: "up" | "down" }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
        <span className={`flex items-center gap-1 text-xs ${trendKind === "up" ? "text-success" : "text-destructive"}`}>
          {trend} <ArrowUpRight className="h-3 w-3" />
        </span>
      </div>
      <div className="mt-4 text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}

function ServiceIcon({ name }: { name: string }) {
  if (name.includes("Database")) return <Database className="h-4 w-4 text-accent" />;
  if (name.includes("Webhook")) return <Webhook className="h-4 w-4 text-accent" />;
  if (name.includes("Discord")) return <Activity className="h-4 w-4 text-accent" />;
  if (name.includes("AI")) return <Cpu className="h-4 w-4 text-accent" />;
  return <Zap className="h-4 w-4 text-accent" />;
}
