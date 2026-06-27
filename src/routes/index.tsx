import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity, Bot, ChevronRight, Cpu, Database, Github, Globe2,
  KeyRound, LineChart, Lock, MessageSquareCode, Network, Send,
  Shield, Sparkles, Webhook, Zap,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Discord Command Center — Slash commands, webhooks & AI in one console" },
      { name: "description", content: "A production-grade control plane for Discord bots: slash command registry, Ed25519 verification, webhook retries, AI summaries and analytics — built for teams." },
      { property: "og:title", content: "Discord Command Center" },
      { property: "og:description", content: "The operations console for modern Discord deployments." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <LogoStrip />
      <Features />
      <Architecture />
      <Screenshots />
      <Pricing />
      <FAQ />
      <Contact />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 backdrop-blur bg-background/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold tracking-tight">Command Center</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#architecture" className="hover:text-foreground">Architecture</a>
          <a href="#pricing" className="hover:text-foreground">Pricing</a>
          <a href="#faq" className="hover:text-foreground">FAQ</a>
          <a href="#contact" className="hover:text-foreground">Contact</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/login" className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline">Sign in</Link>
          <Link to="/register" className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            Start free <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="grid-bg relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 mx-auto h-[600px] max-w-5xl bg-[radial-gradient(ellipse_at_top,oklch(0.66_0.19_275/0.35),transparent_60%)]" />
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
            v2.4 · Ed25519 verification & retry queues now GA
          </span>
          <h1 className="mt-6 text-balance text-5xl font-bold tracking-tight md:text-7xl">
            The <span className="gradient-text">operations console</span> for Discord at scale
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
            Register slash commands, verify interactions with Ed25519, replay failed webhooks and summarize every conversation with AI — all from one production-grade control plane.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link to="/register" className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90">
              Launch dashboard <ChevronRight className="h-4 w-4" />
            </Link>
            <a href="#architecture" className="inline-flex items-center gap-2 rounded-md border border-border bg-card/50 px-6 py-3 text-sm font-medium hover:bg-accent/10">
              View architecture
            </a>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">No credit card · 14-day pro trial · SOC 2 ready</p>
        </div>

        <HeroPreview />
      </div>
    </section>
  );
}

function HeroPreview() {
  return (
    <div className="mx-auto mt-16 max-w-6xl">
      <div className="rounded-2xl border border-border bg-card/60 p-2 shadow-2xl shadow-primary/10 backdrop-blur">
        <div className="flex items-center gap-2 border-b border-border px-4 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
          <span className="ml-3 font-mono text-xs text-muted-foreground">app.commandcenter.io / dashboard</span>
        </div>
        <div className="grid grid-cols-12 gap-2 p-3">
          <div className="col-span-3 hidden rounded-xl bg-sidebar p-3 md:block">
            {["Overview","Commands","History","Analytics","Discord","AI Insights","Webhooks","Monitoring","Audit","Settings"].map((l, i) => (
              <div key={l} className={`mb-1 rounded-md px-3 py-2 text-xs ${i===0?"bg-primary/15 text-primary":"text-muted-foreground"}`}>{l}</div>
            ))}
          </div>
          <div className="col-span-12 grid grid-cols-3 gap-3 md:col-span-9">
            {[
              { l: "Commands today", v: "4,218", d: "+12%", c: "text-success" },
              { l: "Avg latency", v: "92ms", d: "-8ms", c: "text-success" },
              { l: "Webhook success", v: "99.4%", d: "+0.3%", c: "text-success" },
            ].map((m) => (
              <div key={m.l} className="rounded-xl border border-border bg-background/50 p-4">
                <div className="text-xs text-muted-foreground">{m.l}</div>
                <div className="mt-2 flex items-baseline justify-between">
                  <div className="text-2xl font-semibold">{m.v}</div>
                  <div className={`text-xs ${m.c}`}>{m.d}</div>
                </div>
              </div>
            ))}
            <div className="col-span-3 rounded-xl border border-border bg-background/50 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Live activity</div>
                <div className="text-xs text-muted-foreground">streaming</div>
              </div>
              <div className="mt-3 space-y-2 font-mono text-xs">
                {[
                  ["12:48:02","/report","sora#0421","Atlas HQ","success"],
                  ["12:47:58","/status","lain#1138","Nebula Labs","success"],
                  ["12:47:51","/ping","axiom#0001","Synthwave","retrying"],
                  ["12:47:44","/help","neon#9911","Open Source Guild","success"],
                ].map(([t,c,u,g,s]) => (
                  <div key={String(t)+u} className="flex items-center justify-between border-b border-border/60 py-1.5 last:border-0">
                    <span className="text-muted-foreground">{t}</span>
                    <span className="text-accent">{c}</span>
                    <span className="hidden md:inline">{u}</span>
                    <span className="hidden text-muted-foreground md:inline">{g}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] ${s==="success"?"bg-success/15 text-success":"bg-warning/15 text-warning"}`}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LogoStrip() {
  const items = ["ATLAS", "NEBULA", "SYNTHWAVE", "OPEN/DEV", "INDIEHUB", "AETHER"];
  return (
    <section className="border-y border-border/60 bg-card/30">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">Trusted by communities of every size</p>
        <div className="mt-6 grid grid-cols-3 gap-6 opacity-60 md:grid-cols-6">
          {items.map((l) => (
            <div key={l} className="text-center font-mono text-sm tracking-widest">{l}</div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { icon: MessageSquareCode, title: "Slash command registry", body: "Define, version and roll out slash commands across guilds with audit-tracked changes and per-role permissions." },
    { icon: Shield, title: "Ed25519 verification", body: "Every interaction is signature-verified. Replay-protected with deduped interaction IDs out of the box." },
    { icon: Webhook, title: "Webhook retries", body: "Failed deliveries are queued with exponential backoff. Inspect, replay or drop from a single console." },
    { icon: Sparkles, title: "AI summarization", body: "Auto-tag, classify priority, detect sentiment and surface suggested actions on every command." },
    { icon: LineChart, title: "Real-time analytics", body: "Latency, throughput, top commands, top users — broken down by guild, channel and time window." },
    { icon: Lock, title: "Enterprise security", body: "JWT auth, RBAC, session control, audit log and device history. SOC 2 controls in progress." },
  ];
  return (
    <section id="features" className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-mono uppercase tracking-[0.2em] text-accent">Features</p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Everything you need to run a Discord platform</h2>
          <p className="mt-4 text-muted-foreground">From signature verification to AI tagging — primitives that would take quarters to build, available on day one.</p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map(({ icon: Icon, title, body }) => (
            <div key={title} className="group rounded-2xl border border-border bg-card p-6 transition hover:border-primary/40 hover:bg-card/80">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Architecture() {
  const layers = [
    { icon: Globe2, title: "Edge ingress", body: "Signed Discord interactions land at the edge, verified before they ever touch your origin." },
    { icon: Cpu, title: "Service layer", body: "Pure business logic. Clean architecture, repository pattern, fully testable." },
    { icon: Database, title: "PostgreSQL + Prisma", body: "Strongly-typed schema, migrations checked into version control, point-in-time recovery." },
    { icon: Network, title: "Webhook fanout", body: "At-least-once delivery, exponential retry, dead-letter inspection from the UI." },
  ];
  return (
    <section id="architecture" className="border-b border-border/60 bg-card/30">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-mono uppercase tracking-[0.2em] text-accent">Architecture</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Built like the infrastructure it runs on</h2>
            <p className="mt-4 text-muted-foreground">A modular, production-ready stack. React + TypeScript on the front. Node + Express + Prisma on the back. PostgreSQL for state, JWT for sessions, bcrypt for passwords.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {layers.map(({ icon: Icon, title, body }) => (
                <div key={title} className="rounded-xl border border-border bg-background/50 p-5">
                  <Icon className="h-5 w-5 text-accent" />
                  <h4 className="mt-3 font-semibold">{title}</h4>
                  <p className="mt-1 text-xs text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-background p-6 font-mono text-xs leading-relaxed">
            <div className="text-muted-foreground">// repository/command.repo.ts</div>
            <pre className="mt-2 overflow-auto text-foreground"><code>{`export class CommandRepository {
  constructor(private db: PrismaClient) {}

  async record(interaction: Interaction): Promise<Command> {
    return this.db.command.create({
      data: {
        guildId: interaction.guild_id,
        userId:  interaction.member.user.id,
        name:    interaction.data.name,
        payload: interaction.data,
        verified: true,                  // Ed25519 already checked
        receivedAt: new Date(),
      },
    });
  }

  async dedupe(id: string): Promise<boolean> {
    const seen = await this.db.interaction.findUnique({ where: { id } });
    if (seen) return false;
    await this.db.interaction.create({ data: { id } });
    return true;
  }
}`}</code></pre>
          </div>
        </div>
      </div>
    </section>
  );
}

function Screenshots() {
  const shots = [
    { title: "Command history", body: "Sortable, filterable, exportable — with AI-generated summaries inline." },
    { title: "Webhook queue", body: "Replay failed deliveries with one click. Inspect headers and payloads." },
    { title: "Analytics", body: "Latency, throughput, top commands and guilds at a glance." },
  ];
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-mono uppercase tracking-[0.2em] text-accent">Inside the console</p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">A control plane your ops team will actually use</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {shots.map((s) => (
            <div key={s.title} className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="h-44 bg-gradient-to-br from-primary/20 via-accent/15 to-success/15 p-4">
                <div className="grid h-full grid-cols-3 gap-2">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="rounded-md bg-background/60" style={{ opacity: 0.4 + (i % 3) * 0.2 }} />
                  ))}
                </div>
              </div>
              <div className="p-5">
                <h4 className="font-semibold">{s.title}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const tiers = [
    { name: "Free", price: "$0", desc: "For hobbyists and side projects.", features: ["Up to 2 guilds", "5,000 commands / mo", "Community support", "Basic analytics"], cta: "Start free", featured: false },
    { name: "Team", price: "$29", desc: "For growing communities.", features: ["Up to 20 guilds", "250,000 commands / mo", "AI summaries", "Webhook retries", "Email support"], cta: "Start trial", featured: true },
    { name: "Enterprise", price: "Custom", desc: "For platforms at scale.", features: ["Unlimited guilds", "SSO + SAML", "Dedicated infra", "SLA & audit log export", "Solutions engineer"], cta: "Contact sales", featured: false },
  ];
  return (
    <section id="pricing" className="border-b border-border/60 bg-card/30">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center">
          <p className="text-sm font-mono uppercase tracking-[0.2em] text-accent">Pricing</p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Start free. Scale when you do.</h2>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {tiers.map((t) => (
            <div key={t.name} className={`relative rounded-2xl border p-7 ${t.featured ? "border-primary bg-gradient-to-b from-primary/10 to-transparent" : "border-border bg-card"}`}>
              {t.featured && <span className="absolute -top-3 left-7 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">Most popular</span>}
              <h3 className="text-lg font-semibold">{t.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{t.price}</span>
                {t.price !== "Custom" && <span className="text-sm text-muted-foreground">/ month</span>}
              </div>
              <ul className="mt-6 space-y-2.5 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2"><Zap className="mt-0.5 h-4 w-4 shrink-0 text-success" />{f}</li>
                ))}
              </ul>
              <Link to="/register" className={`mt-8 inline-flex w-full items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium ${t.featured ? "bg-primary text-primary-foreground" : "border border-border hover:bg-accent/10"}`}>{t.cta}</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    { q: "How does signature verification work?", a: "Every interaction request from Discord is verified with Ed25519 using your application's public key before reaching any handler — invalid requests are rejected at the edge with a 401." },
    { q: "Do you store message content?", a: "Only the metadata required to operate your bot — command names, parameters and execution metadata. Message bodies are never persisted unless you explicitly opt in for AI summarization." },
    { q: "What happens when a webhook delivery fails?", a: "Failures land in a retry queue with exponential backoff. You can inspect, replay or drop them manually from the Notifications view." },
    { q: "Can I export my data?", a: "Yes. Command history is exportable to CSV or JSON, and the audit log can be streamed to your SIEM via webhook." },
    { q: "Is there a self-hosted option?", a: "Enterprise plans include a self-host package with Helm charts and Terraform modules." },
  ];
  return (
    <section id="faq" className="border-b border-border/60">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <p className="text-sm font-mono uppercase tracking-[0.2em] text-accent">FAQ</p>
        <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Questions, answered</h2>
        <div className="mt-10 divide-y divide-border rounded-2xl border border-border bg-card">
          {items.map((it, i) => <FAQItem key={i} q={it.q} a={it.a} defaultOpen={i === 0} />)}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ q, a, defaultOpen }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <details open={open} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)} className="group p-5">
      <summary className="flex cursor-pointer items-center justify-between text-left font-medium">
        {q}
        <ChevronRight className={`h-4 w-4 text-muted-foreground transition ${open ? "rotate-90" : ""}`} />
      </summary>
      <p className="mt-3 text-sm text-muted-foreground">{a}</p>
    </details>
  );
}

function Contact() {
  return (
    <section id="contact" className="border-b border-border/60 bg-card/30">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-mono uppercase tracking-[0.2em] text-accent">Contact</p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Talk to the team</h2>
          <p className="mt-4 text-muted-foreground">Rolling out a large community, migrating from a custom stack, or just want to see a live demo? Drop us a line.</p>
          <div className="mt-8 space-y-3 text-sm">
            <div className="flex items-center gap-3"><Send className="h-4 w-4 text-accent" /> hello@commandcenter.io</div>
            <div className="flex items-center gap-3"><Github className="h-4 w-4 text-accent" /> github.com/command-center</div>
            <div className="flex items-center gap-3"><Activity className="h-4 w-4 text-accent" /> status.commandcenter.io</div>
          </div>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); (e.target as HTMLFormElement).reset(); }}
          className="rounded-2xl border border-border bg-background p-6"
        >
          <div className="grid gap-4">
            <div className="grid gap-1.5"><label className="text-xs text-muted-foreground">Name</label><input required className="rounded-md border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-primary" /></div>
            <div className="grid gap-1.5"><label className="text-xs text-muted-foreground">Email</label><input required type="email" className="rounded-md border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-primary" /></div>
            <div className="grid gap-1.5"><label className="text-xs text-muted-foreground">Message</label><textarea required rows={4} className="rounded-md border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-primary" /></div>
            <button className="rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">Send message</button>
          </div>
        </form>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <Bot className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold">Command Center</span>
          </div>
          <p className="mt-3 max-w-xs text-xs text-muted-foreground">The operations console for modern Discord deployments.</p>
        </div>
        <FooterCol title="Product" links={["Features","Pricing","Changelog","Roadmap"]} />
        <FooterCol title="Developers" links={["Docs","API Reference","Status","Security"]} />
        <FooterCol title="Company" links={["About","Blog","Careers","Privacy"]} />
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Command Center, Inc.</span>
          <span className="flex items-center gap-2 font-mono"><KeyRound className="h-3 w-3" /> Ed25519 verified · SOC 2 ready</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
        {links.map((l) => <li key={l}><a className="hover:text-foreground" href="#">{l}</a></li>)}
      </ul>
    </div>
  );
}
