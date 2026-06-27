import nacl from "tweetnacl";

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}

export function verifyDiscordSignature(
  rawBody: string,
  signature: string | null,
  timestamp: string | null,
  publicKey: string,
): boolean {
  if (!signature || !timestamp) return false;
  try {
    const sig = hexToBytes(signature);
    const key = hexToBytes(publicKey);
    const msg = new TextEncoder().encode(timestamp + rawBody);
    return nacl.sign.detached.verify(msg, sig, key);
  } catch {
    return false;
  }
}

export const InteractionType = {
  PING: 1,
  APPLICATION_COMMAND: 2,
  MESSAGE_COMPONENT: 3,
  MODAL_SUBMIT: 5,
} as const;

export const InteractionResponseType = {
  PONG: 1,
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE: 5,
} as const;

export async function aiTagSummary(text: string): Promise<{ summary: string; tag: string } | null> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key || !text) return null;
  try {
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: 'You triage Discord support messages. Reply with strict JSON: {"summary":"<=18 words","tag":"bug|feature|question|outage|spam|other"}' },
          { role: "user", content: text.slice(0, 800) },
        ],
      }),
    });
    if (!r.ok) return null;
    const j = await r.json() as { choices?: { message?: { content?: string } }[] };
    const content = j.choices?.[0]?.message?.content ?? "";
    const m = content.match(/\{[\s\S]*\}/);
    if (!m) return null;
    const parsed = JSON.parse(m[0]);
    return { summary: String(parsed.summary ?? ""), tag: String(parsed.tag ?? "other") };
  } catch {
    return null;
  }
}

export async function mirrorToWebhook(url: string, content: string): Promise<boolean> {
  try {
    // Try Discord webhook shape first; falls back to Slack shape if it 400s.
    const r = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content, text: content }),
    });
    return r.ok || r.status === 204;
  } catch {
    return false;
  }
}
