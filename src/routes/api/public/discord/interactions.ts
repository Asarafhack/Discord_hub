import { createFileRoute } from "@tanstack/react-router";
import {
  InteractionResponseType,
  InteractionType,
  aiTagSummary,
  mirrorToWebhook,
  verifyDiscordSignature,
} from "@/lib/discord.server";

type InteractionData = {
  id: string;
  type: number;
  guild_id?: string;
  channel_id?: string;
  member?: { user?: { id?: string; username?: string; discriminator?: string } };
  user?: { id?: string; username?: string; discriminator?: string };
  data?: {
    name?: string;
    options?: { name: string; value: string | number | boolean }[];
  };
};

function userTag(p: InteractionData) {
  const u = p.member?.user ?? p.user;
  if (!u?.username) return "unknown";
  return u.discriminator && u.discriminator !== "0" ? `${u.username}#${u.discriminator}` : u.username;
}

export const Route = createFileRoute("/api/public/discord/interactions")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const publicKey = process.env.DISCORD_PUBLIC_KEY;
        if (!publicKey) {
          return new Response("Server not configured", { status: 500 });
        }

        const rawBody = await request.text();
        const sig = request.headers.get("x-signature-ed25519");
        const ts = request.headers.get("x-signature-timestamp");

        if (!verifyDiscordSignature(rawBody, sig, ts, publicKey)) {
          return new Response("invalid request signature", { status: 401 });
        }

        const payload = JSON.parse(rawBody) as InteractionData;

        // PING
        if (payload.type === InteractionType.PING) {
          return Response.json({ type: InteractionResponseType.PONG });
        }

        if (payload.type !== InteractionType.APPLICATION_COMMAND) {
          return Response.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: "Unsupported interaction.", flags: 64 },
          });
        }

        const commandName = payload.data?.name ?? "unknown";
        const textArg = String(
          payload.data?.options?.find((o) => o.name === "text" || o.name === "message")?.value ?? "",
        );
        const tag = userTag(payload);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Lookup command config
        const { data: cmd } = await supabaseAdmin
          .from("slash_commands")
          .select("*")
          .eq("name", commandName)
          .maybeSingle();

        // Dedup by interaction id; ignore unique-violation = replay
        const baseRow = {
          interaction_id: payload.id,
          guild_id: payload.guild_id ?? null,
          channel_id: payload.channel_id ?? null,
          user_tag: tag,
          user_id: (payload.member?.user ?? payload.user)?.id ?? null,
          command_name: commandName,
          command_text: textArg || null,
        };

        const { error: insertErr } = await supabaseAdmin.from("interactions").insert(baseRow);
        if (insertErr && insertErr.code === "23505") {
          // Replay — already processed
          return Response.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: "Already processed.", flags: 64 },
          });
        }

        // Build response
        let reply = cmd?.response_template ?? `Command \`/${commandName}\` received.`;
        reply = reply
          .replace("{id}", payload.id.slice(-6))
          .replace("{user}", tag)
          .replace("{text}", textArg || "(no input)");

        if (!cmd?.enabled) {
          reply = `Command \`/${commandName}\` is currently disabled.`;
        }

        // Optional AI tagging — only for commands that opt in and have text
        let aiSummary: string | null = null;
        let aiTag: string | null = null;
        if (cmd?.ai_enabled && textArg) {
          const ai = await aiTagSummary(textArg);
          if (ai) {
            aiSummary = ai.summary;
            aiTag = ai.tag;
            reply += `\n\n• AI tag: \`${ai.tag}\` — ${ai.summary}`;
          }
        }

        // Mirror to second channel if configured
        let mirrored = false;
        const mirrorUrl = process.env.DISCORD_MIRROR_WEBHOOK_URL;
        if (mirrorUrl && cmd?.mirror_on_run !== false) {
          mirrored = await mirrorToWebhook(
            mirrorUrl,
            `📣 **/${commandName}** by **${tag}**${textArg ? `: ${textArg}` : ""}${aiTag ? ` _[${aiTag}]_` : ""}`,
          );
        }

        // Update log with outcome (don't fail the response if this errors)
        await supabaseAdmin
          .from("interactions")
          .update({ ai_summary: aiSummary, ai_tag: aiTag, mirrored, status: cmd?.enabled === false ? "disabled" : "success" })
          .eq("interaction_id", payload.id);

        return Response.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: reply },
        });
      },
    },
  },
});
