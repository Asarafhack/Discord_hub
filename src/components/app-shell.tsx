import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Activity, BarChart3, Bell, Bot, ChevronDown, FileText, Gauge, History,
  KeyRound, LayoutDashboard, LogOut, Menu, MessageSquareCode, Search,
  Settings, Shield, Sparkles, User, X, Webhook,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { getSession, hydrateSession, signOut, type Session } from "@/lib/auth";
import { notifications } from "@/lib/mock";

type NavItem = { to: string; label: string; icon: React.ComponentType<{ className?: string }>; end?: boolean };
const nav: NavItem[] = [
  { to: "/app", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/app/commands", label: "Slash Commands", icon: MessageSquareCode },
  { to: "/app/history", label: "Command History", icon: History },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/discord", label: "Discord Integration", icon: Bot },
  { to: "/app/ai", label: "AI Insights", icon: Sparkles },
  { to: "/app/notifications", label: "Notifications", icon: Bell },
  { to: "/app/monitoring", label: "Monitoring", icon: Gauge },
  { to: "/app/security", label: "Security", icon: Shield },
  { to: "/app/audit", label: "Audit Log", icon: FileText },
  { to: "/app/settings", label: "Settings", icon: Settings },
  { to: "/app/profile", label: "Profile", icon: User },
];

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(() => getSession());
  const [ready, setReady] = useState<boolean>(() => getSession() !== null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    hydrateSession().then((s) => {
      if (cancelled) return;
      if (!s) navigate({ to: "/login" });
      else setSession(s);
      setReady(true);
    });
    return () => { cancelled = true; };
  }, [navigate]);

  if (!ready || !session) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-background/80 backdrop-blur" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-sidebar p-4">
            <SidebarBody onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-sidebar-border bg-sidebar p-4 lg:block">
          <SidebarBody />
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar session={session} onMenu={() => setMobileOpen(true)} onSignOut={() => { signOut(); navigate({ to: "/login" }); }} />
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  return (
    <div className="flex h-full flex-col">
      <Link to="/" className="mb-6 flex items-center gap-2 px-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent">
          <Bot className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-semibold tracking-tight">Command Center</span>
      </Link>

      <nav className="flex-1 space-y-0.5 overflow-y-auto pr-1">
        {nav.map(({ to, label, icon: Icon, end }) => {
          const active = end ? pathname === to : pathname === to || pathname.startsWith(to + "/");
          return (
            <Link
              key={to}
              to={to}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                active ? "bg-primary/15 text-primary" : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-4">
        <div className="flex items-center gap-2 text-xs text-success">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" /> All systems operational
        </div>
        <p className="mt-2 text-xs text-muted-foreground">99.98% uptime over the last 30 days.</p>
        <Link to="/app/monitoring" className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline">
          View status <ChevronDown className="h-3 w-3 -rotate-90" />
        </Link>
      </div>
    </div>
  );
}

function Topbar({ session, onMenu, onSignOut }: { session: Session; onMenu: () => void; onSignOut: () => void }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profOpen, setProfOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const unread = notifications.filter((n) => n.unread).length;
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/70 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 md:px-8">
        <button onClick={onMenu} className="rounded-md p-2 text-muted-foreground hover:bg-accent/10 lg:hidden"><Menu className="h-5 w-5" /></button>
        <button onClick={() => setPaletteOpen(true)} className="hidden flex-1 items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 text-left text-sm text-muted-foreground hover:border-primary/40 md:flex md:max-w-md">
          <Search className="h-4 w-4" />
          <span>Search commands, users, guilds…</span>
          <kbd className="ml-auto rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
        </button>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <button onClick={() => { setNotifOpen((v) => !v); setProfOpen(false); }} className="relative rounded-md p-2 text-muted-foreground hover:bg-accent/10">
              <Bell className="h-5 w-5" />
              {unread > 0 && <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">{unread}</span>}
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-popover p-2 shadow-2xl">
                <div className="flex items-center justify-between px-2 py-2">
                  <span className="text-sm font-medium">Notifications</span>
                  <Link to="/app/notifications" onClick={() => setNotifOpen(false)} className="text-xs text-primary hover:underline">View all</Link>
                </div>
                <div className="max-h-80 space-y-1 overflow-auto">
                  {notifications.slice(0, 5).map((n) => (
                    <div key={n.id} className="rounded-lg px-2 py-2 hover:bg-accent/10">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium">{n.title}</span>
                        <span className="shrink-0 text-[10px] text-muted-foreground">{n.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{n.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <button onClick={() => { setProfOpen((v) => !v); setNotifOpen(false); }} className="flex items-center gap-2 rounded-md p-1.5 hover:bg-accent/10">
              <Avatar name={session.name || session.email} />
              <div className="hidden text-left md:block">
                <div className="text-sm font-medium leading-tight">{session.name || "Operator"}</div>
                <div className="text-xs text-muted-foreground leading-tight">{session.role}</div>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
            </button>
            {profOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-popover p-1 shadow-2xl">
                <Link to="/app/profile" onClick={() => setProfOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent/10"><User className="h-4 w-4" /> Profile</Link>
                <Link to="/app/settings" onClick={() => setProfOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent/10"><Settings className="h-4 w-4" /> Settings</Link>
                <Link to="/app/security" onClick={() => setProfOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent/10"><KeyRound className="h-4 w-4" /> Security</Link>
                <div className="my-1 h-px bg-border" />
                <button onClick={onSignOut} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"><LogOut className="h-4 w-4" /> Sign out</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
    </header>
  );
}

export function Avatar({ name }: { name: string }) {
  const initials = name.split(/[\s@]/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
  return (
    <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-semibold text-primary-foreground">
      {initials || "OP"}
    </div>
  );
}

function CommandPalette({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const items = [
    { label: "Go to Overview", to: "/app", icon: LayoutDashboard },
    { label: "View Command History", to: "/app/history", icon: History },
    { label: "Open Analytics", to: "/app/analytics", icon: BarChart3 },
    { label: "Discord Integration", to: "/app/discord", icon: Bot },
    { label: "Webhook health", to: "/app/monitoring", icon: Webhook },
    { label: "Audit log", to: "/app/audit", icon: FileText },
    { label: "Open Settings", to: "/app/settings", icon: Settings },
    { label: "AI Insights", to: "/app/ai", icon: Activity },
  ];
  const filtered = items.filter((i) => i.label.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-background/70 p-4 pt-32 backdrop-blur" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl border border-border bg-popover shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type a command or search…" className="w-full bg-transparent py-2 text-sm outline-none" />
          <button onClick={onClose} className="rounded p-1 text-muted-foreground hover:bg-accent/10"><X className="h-4 w-4" /></button>
        </div>
        <div className="max-h-80 overflow-auto p-2">
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">No results.</p>
          ) : filtered.map((it) => (
            <Link key={it.to} to={it.to} onClick={onClose} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent/10">
              <it.icon className="h-4 w-4 text-muted-foreground" /> {it.label}
            </Link>
          ))}
        </div>
        <div className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground">↑↓ navigate · ↵ select · esc close</div>
      </div>
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-border bg-card ${className}`}>{children}</div>;
}

export function CardHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    success: "bg-success/15 text-success border-success/30",
    failed: "bg-destructive/15 text-destructive border-destructive/30",
    pending: "bg-warning/15 text-warning border-warning/30",
    retrying: "bg-info/15 text-info border-info/30",
    operational: "bg-success/15 text-success border-success/30",
    degraded: "bg-warning/15 text-warning border-warning/30",
    healthy: "bg-success/15 text-success border-success/30",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${map[status] ?? "bg-muted text-muted-foreground border-border"}`}>
      <span className="h-1 w-1 rounded-full bg-current" />
      {status}
    </span>
  );
}
