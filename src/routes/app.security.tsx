import { createFileRoute } from "@tanstack/react-router";
import { Card, CardHeader, PageHeader, StatusBadge } from "@/components/app-shell";
import { auditLog } from "@/lib/mock";
import { passwordStrength, getSession } from "@/lib/auth";
import { useMemo, useState } from "react";
import { Eye, EyeOff, Key, Laptop, LogOut, Shield, ShieldAlert, ShieldCheck, Smartphone } from "lucide-react";

export const Route = createFileRoute("/app/security")({
  head: () => ({ meta: [{ title: "Security — Command Center" }] }),
  component: Security,
});

function Security() {
  const session = typeof window !== "undefined" ? getSession() : null;
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const strength = useMemo(() => passwordStrength(pw), [pw]);
  const colors = ["bg-muted","bg-destructive","bg-warning","bg-info","bg-success"];

  return (
    <div>
      <PageHeader title="Security" description="JWT sessions, password policy, devices and security alerts." />

      <div className="grid gap-4 md:grid-cols-4">
        <Tile icon={ShieldCheck} label="2FA" value="Enabled" tone="success" />
        <Tile icon={Shield} label="Login rate limit" value="5/min" tone="info" />
        <Tile icon={Key} label="JWT expiry" value="7 days" tone="info" />
        <Tile icon={ShieldAlert} label="Open alerts" value="1" tone="warning" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Password" description="Choose a strong unique password." />
          <div className="space-y-4 p-5">
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">New password</span>
              <div className="mt-1.5 flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2">
                <input value={pw} onChange={(e) => setPw(e.target.value)} type={show ? "text" : "password"} className="w-full bg-transparent text-sm outline-none" />
                <button type="button" onClick={() => setShow((s) => !s)} className="text-muted-foreground">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
            </label>
            <div>
              <div className="flex gap-1">
                {[0,1,2,3].map((i) => <div key={i} className={`h-1 flex-1 rounded-full ${i < strength.score ? colors[strength.score] : "bg-muted"}`} />)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Strength: {strength.label}</p>
            </div>
            <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Update password</button>
          </div>
        </Card>

        <Card>
          <CardHeader title="Active sessions" />
          <div className="divide-y divide-border">
            {[
              { device: "MacBook Pro · macOS 14", ip: "10.0.4.21", current: true, icon: Laptop },
              { device: "iPhone 15 · iOS 17", ip: "10.0.4.22", current: false, icon: Smartphone },
              { device: "Linux · Firefox", ip: "10.0.4.41", current: false, icon: Laptop },
            ].map((d) => (
              <div key={d.device} className="flex items-center justify-between px-5 py-3 text-sm">
                <div className="flex items-center gap-3">
                  <d.icon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div>{d.device}</div>
                    <div className="text-xs text-muted-foreground">{d.ip} · last seen 2m ago</div>
                  </div>
                </div>
                {d.current ? <StatusBadge status="operational" /> : <button className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs hover:bg-destructive/10 hover:text-destructive"><LogOut className="h-3.5 w-3.5" /> Sign out</button>}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Activity history" description="Recent security-relevant events" />
        <div className="divide-y divide-border">
          {auditLog.slice(0, 8).map((a) => (
            <div key={a.id} className="flex items-center justify-between px-5 py-3 text-sm">
              <div>
                <div>{a.actor} <span className="text-muted-foreground">— {a.action}</span></div>
                <div className="text-xs text-muted-foreground">{a.ip} · {new Date(a.time).toLocaleString()}</div>
              </div>
              <StatusBadge status="operational" />
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-6 border-warning/30 bg-warning/5">
        <div className="flex items-start justify-between gap-3 p-5">
          <div>
            <div className="font-medium">CSRF protection</div>
            <p className="mt-1 text-xs text-muted-foreground">Double-submit cookie + same-site lax. Token rotated every {session ? "request" : "session"}.</p>
          </div>
          <StatusBadge status="operational" />
        </div>
      </Card>
    </div>
  );
}

function Tile({ icon: Icon, label, value, tone }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; tone: "success"|"warning"|"info" }) {
  const c = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-info";
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5" /> {label}</div>
      <div className={`mt-2 text-2xl font-semibold ${c}`}>{value}</div>
    </Card>
  );
}
