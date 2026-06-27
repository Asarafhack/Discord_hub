import { createFileRoute } from "@tanstack/react-router";
import { Card, CardHeader, PageHeader, StatusBadge } from "@/components/app-shell";
import { systemHealth, usageSeries } from "@/lib/mock";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/app/monitoring")({
  head: () => ({ meta: [{ title: "Monitoring — Command Center" }] }),
  component: Monitoring,
});

function Monitoring() {
  return (
    <div>
      <PageHeader title="Monitoring" description="Real-time health across services, hardware and queues." />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {systemHealth.map((s) => (
          <Card key={s.name} className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{s.name}</span>
              <StatusBadge status={s.status} />
            </div>
            <div className="mt-2 text-2xl font-semibold">{s.latency}<span className="text-sm font-normal text-muted-foreground">ms</span></div>
            <div className="mt-1 text-xs text-muted-foreground">{s.uptime}% uptime</div>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="CPU usage" description="Last 14 days" />
          <Chart data={usageSeries.map((d) => ({ day: d.day, v: 30 + Math.round(Math.random() * 40) }))} />
        </Card>
        <Card>
          <CardHeader title="Memory usage" description="Last 14 days" />
          <Chart data={usageSeries.map((d) => ({ day: d.day, v: 40 + Math.round(Math.random() * 30) }))} />
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Queue status" />
        <div className="grid gap-4 p-5 md:grid-cols-3">
          {[
            { l: "Interaction queue", v: 18, max: 1000 },
            { l: "Webhook queue", v: 14, max: 500 },
            { l: "AI summarization", v: 32, max: 200 },
          ].map((q) => (
            <div key={q.l}>
              <div className="flex justify-between text-xs"><span>{q.l}</span><span className="text-muted-foreground">{q.v}/{q.max}</span></div>
              <div className="mt-1 h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${(q.v / q.max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Chart({ data }: { data: { day: string; v: number }[] }) {
  return (
    <div className="p-4">
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="m1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.75 0.15 200)" stopOpacity={0.5} />
              <stop offset="100%" stopColor="oklch(0.75 0.15 200)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="oklch(0.3 0.025 260)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="day" stroke="oklch(0.6 0.02 255)" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="oklch(0.6 0.02 255)" fontSize={11} tickLine={false} axisLine={false} unit="%" />
          <Tooltip contentStyle={{ background: "oklch(0.22 0.025 260)", border: "1px solid oklch(0.3 0.025 260)", borderRadius: 8, fontSize: 12 }} />
          <Area type="monotone" dataKey="v" stroke="oklch(0.75 0.15 200)" fill="url(#m1)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
