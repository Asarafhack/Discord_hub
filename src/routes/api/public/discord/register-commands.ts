import { createFileRoute } from "@tanstack/react-router";

// POST { adminToken } — requires the caller to provide a Supabase access token
// belonging to a user with the 'admin' role. Registers (or replaces) all enabled
// slash commands globally on the configured Discord application.
export const Route = createFileRoute("/api/public/discord/register-commands")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const appId = process.env.DISCORD_APPLICATION_ID;
        const token = process.env.DISCORD_BOT_TOKEN;
        if (!appId || !token) return new Response("Discord not configured", { status: 500 });

        const authHeader = request.headers.get("authorization");
        const accessToken = authHeader?.replace(/^Bearer\s+/i, "");
        if (!accessToken) return new Response("Unauthorized", { status: 401 });

        const { createClient } = await import("@supabase/supabase-js");
        const userClient = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_PUBLISHABLE_KEY!,
          { global: { headers: { Authorization: `Bearer ${accessToken}` } }, auth: { persistSession: false } },
        );
        const { data: userData, error: userErr } = await userClient.auth.getUser();
        if (userErr || !userData.user) return new Response("Unauthorized", { status: 401 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: role } = await supabaseAdmin
          .from("user_roles")
          .select("role")
          .eq("user_id", userData.user.id)
          .eq("role", "admin")
          .maybeSingle();
        if (!role) return new Response("Forbidden", { status: 403 });

        const { data: commands } = await supabaseAdmin
          .from("slash_commands")
          .select("*")
          .eq("enabled", true);

        const body = (commands ?? []).map((c) => ({
          name: c.name,
          description: c.description || `Run /${c.name}`,
          options: c.name === "report"
            ? [{ name: "text", description: "Describe the issue", type: 3, required: true }]
            : [],
        }));

        const r = await fetch(`https://discord.com/api/v10/applications/${appId}/commands`, {
          method: "PUT",
          headers: { "content-type": "application/json", authorization: `Bot ${token}` },
          body: JSON.stringify(body),
        });

        const text = await r.text();
        await supabaseAdmin.from("audit_log").insert({
          actor_id: userData.user.id,
          actor_email: userData.user.email,
          action: "registered slash commands",
          target: "discord",
          meta: { count: body.length, status: r.status },
        });

        if (!r.ok) return new Response(`Discord rejected: ${text}`, { status: 502 });
        return Response.json({ ok: true, registered: body.length, response: JSON.parse(text) });
      },
    },
  },
});
