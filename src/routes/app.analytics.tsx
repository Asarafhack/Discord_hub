import { createFileRoute } from "@tanstack/react-router";
import { Card, CardHeader, PageHeader } from "@/components/app-shell";
import { commandsByType, topUsers, usageSeries, connectedServers } from "@/lib/mock";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line,
  LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

export const Route = createFileRoute("/app/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Command Center" }] }),
  component: Analytics,
});

const COLORS = ["oklch(0.66 0.19 275)", "oklch(0.75 0.15 200)", "oklch(0.72 0.16 160)", "oklch(0.8 0.16 80)", "oklch(0.7 0.2 330)", "oklch(0.6 0.18 250)"];

function Analytics() {
  return (
    <div>
      <PageHeader title="Analytics" description="Deep insight into command usage, performance, users and guilds." />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Commands per day" description="Last 14 days" />
          <div className="p-4">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={usageSeries}>
                <defs>
                  <linearGradient id="a1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS[0]} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={COLORS[0]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(0.3 0.025 260)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="oklch(0.6 0.02 255)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.6 0.02 255)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="commands" stroke={COLORS[0]} fill="url(#a1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Response time" description="Median latency (ms)" />
          <div className="p-4">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={usageSeries}>
                <CartesianGrid stroke="oklch(0.3 0.025 260)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="oklch(0.6 0.02 255)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.6 0.02 255)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="latency" stroke={COLORS[2]} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Most used commands" />
          <div className="p-4">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={commandsByType} layout="vertical">
                <CartesianGrid stroke="oklch(0.3 0.025 260)" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="oklch(0.6 0.02 255)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="oklch(0.6 0.02 255)" fontSize={11} tickLine={false} axisLine={false} width={80} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill={COLORS[1]} radius={[0,6,6,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Top users" description="By command volume" />
          <div className="divide-y divide-border">
            {topUsers.map((u, i) => (
              <div key={u.user} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <div className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">#{i + 1}</span>
                  <span className="font-mono text-xs">{u.user}</span>
                </div>
                <div className="text-xs text-muted-foreground">{u.commands} commands</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Webhook success rate" description="By day" />
          <div className="p-4">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={usageSeries.map((d) => ({ day: d.day, ok: 100 - d.errors / 4, fail: d.errors / 4 }))} stackOffset="expand">
                <CartesianGrid stroke="oklch(0.3 0.025 260)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="oklch(0.6 0.02 255)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.6 0.02 255)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(v * 100)}%`} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="ok" stackId="a" fill={COLORS[2]} radius={[6,6,0,0]} />
                <Bar dataKey="fail" stackId="a" fill={COLORS[3]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Server usage" description="Top guilds" />
          <div className="p-4">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={connectedServers.map((s) => ({ name: s.name, value: s.members }))} dataKey="value" outerRadius={90} label>
                  {connectedServers.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {[
          { l: "Avg processing time", v: "138ms" },
          { l: "Failed commands (7d)", v: "84" },
          { l: "Total interactions", v: "128,402" },
        ].map((m) => (
          <Card key={m.l} className="p-5">
            <div className="text-xs text-muted-foreground">{m.l}</div>
            <div className="mt-2 text-3xl font-semibold">{m.v}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

const tooltipStyle = { background: "oklch(0.22 0.025 260)", border: "1px solid oklch(0.3 0.025 260)", borderRadius: 8, fontSize: 12 } as const;
