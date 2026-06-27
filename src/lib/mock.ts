// Mock data layer. Swap with real API client when backend is ready.

export type CommandStatus = "success" | "failed" | "pending" | "retrying";
export interface CommandRecord {
  id: string;
  name: string;
  user: string;
  guild: string;
  channel: string;
  timestamp: string;
  executionMs: number;
  status: CommandStatus;
  retryCount: number;
  aiSummary: string;
}

export const slashCommands = [
  { name: "/report", description: "Submit a bug, issue, or incident report.", enabled: true, permission: "Member", cooldownSec: 10, template: "Report received. Ref #{id}." },
  { name: "/status", description: "Check live system, bot and webhook status.", enabled: true, permission: "Everyone", cooldownSec: 5, template: "All systems operational." },
  { name: "/help", description: "Show available commands and usage examples.", enabled: true, permission: "Everyone", cooldownSec: 3, template: "Available commands: …" },
  { name: "/ping", description: "Latency check between bot, gateway and webhook.", enabled: true, permission: "Everyone", cooldownSec: 1, template: "Pong! Latency: {ms}ms" },
  { name: "/settings", description: "Update per-guild configuration (admin only).", enabled: true, permission: "Admin", cooldownSec: 0, template: "Settings updated." },
  { name: "/history", description: "Query recent command executions for this guild.", enabled: false, permission: "Moderator", cooldownSec: 15, template: "Last {n} executions: …" },
];

const users = ["sora#0421", "lain#1138", "axiom#0001", "neon#9911", "kira#7720", "vega#4040", "atlas#3301"];
const guilds = ["Atlas HQ", "Nebula Labs", "Synthwave", "Open Source Guild", "Indie Devs"];
const channels = ["#general", "#alerts", "#ops", "#support", "#bots", "#deploy"];
const ais = [
  "User reports authentication latency spikes on EU region.",
  "Routine status check, no anomalies detected.",
  "Permission escalation attempt — flagged for review.",
  "Webhook delivery recovered after 2 retries.",
  "User requested help for /report flow.",
  "Configuration updated by guild administrator.",
];
const statuses: CommandStatus[] = ["success", "success", "success", "success", "failed", "pending", "retrying"];

function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export const commandHistory: CommandRecord[] = (() => {
  const rnd = seededRand(42);
  const now = Date.now();
  return Array.from({ length: 86 }, (_, i) => {
    const cmd = slashCommands[Math.floor(rnd() * slashCommands.length)];
    return {
      id: `intr_${(1000 + i).toString(36)}`,
      name: cmd.name,
      user: users[Math.floor(rnd() * users.length)],
      guild: guilds[Math.floor(rnd() * guilds.length)],
      channel: channels[Math.floor(rnd() * channels.length)],
      timestamp: new Date(now - i * 1000 * 60 * (3 + Math.floor(rnd() * 22))).toISOString(),
      executionMs: Math.floor(40 + rnd() * 480),
      status: statuses[Math.floor(rnd() * statuses.length)],
      retryCount: Math.floor(rnd() * 3),
      aiSummary: ais[Math.floor(rnd() * ais.length)],
    };
  });
})();

export const usageSeries = Array.from({ length: 14 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (13 - i));
  return {
    day: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    commands: 240 + Math.round(Math.sin(i / 2) * 80 + Math.random() * 60),
    errors: 4 + Math.round(Math.random() * 12),
    latency: 90 + Math.round(Math.random() * 40),
  };
});

export const commandsByType = slashCommands.map((c, i) => ({
  name: c.name,
  value: 320 - i * 38 + Math.round(Math.random() * 40),
}));

export const topUsers = users.map((u, i) => ({ user: u, commands: 180 - i * 18 - Math.round(Math.random() * 10) }));

export const connectedServers = guilds.map((g, i) => ({
  id: `g_${i}`,
  name: g,
  members: 240 + i * 312,
  channels: 8 + i * 3,
  status: i === 2 ? "degraded" : "healthy",
  region: ["us-east", "eu-west", "ap-south", "us-west", "eu-north"][i],
}));

export const notifications = [
  { id: "n1", title: "Webhook recovered", body: "Endpoint webhooks.atlas.dev responded after 2 retries.", time: "2m ago", unread: true, kind: "success" as const },
  { id: "n2", title: "Rate limit warning", body: "/status command hitting 70% of quota.", time: "14m ago", unread: true, kind: "warning" as const },
  { id: "n3", title: "New admin login", body: "axiom#0001 signed in from a new device.", time: "1h ago", unread: false, kind: "info" as const },
  { id: "n4", title: "Signature failure", body: "1 interaction dropped — Ed25519 verification failed.", time: "3h ago", unread: false, kind: "danger" as const },
  { id: "n5", title: "Daily report ready", body: "Yesterday: 4,218 commands, 99.6% success.", time: "9h ago", unread: false, kind: "info" as const },
];

export const auditLog = Array.from({ length: 24 }, (_, i) => ({
  id: `a_${i}`,
  actor: users[i % users.length],
  action: ["updated command /status", "rotated API key", "added webhook", "removed member", "changed notification settings", "enabled /history"][i % 6],
  target: ["command", "security", "integration", "user", "settings", "command"][i % 6],
  ip: `10.${i}.${(i * 7) % 255}.${(i * 13) % 255}`,
  time: new Date(Date.now() - i * 3600_000 * (1 + (i % 4))).toISOString(),
}));

export const systemHealth = [
  { name: "API", status: "operational", latency: 42, uptime: 99.99 },
  { name: "Database", status: "operational", latency: 11, uptime: 99.98 },
  { name: "Discord Gateway", status: "operational", latency: 87, uptime: 99.94 },
  { name: "Webhook Dispatcher", status: "degraded", latency: 312, uptime: 99.41 },
  { name: "AI Pipeline", status: "operational", latency: 640, uptime: 99.82 },
];

export const aiInsights = {
  summarized: 1284,
  taggedHigh: 42,
  taggedMed: 311,
  taggedLow: 931,
  avgConfidence: 0.87,
  topTags: [
    { tag: "auth-issue", count: 84 },
    { tag: "rate-limit", count: 61 },
    { tag: "feature-request", count: 52 },
    { tag: "billing", count: 38 },
    { tag: "outage", count: 19 },
  ],
};
