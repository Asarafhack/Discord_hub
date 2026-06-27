# AI Notes

## Tools and split

- **Lovable agent (Anthropic Claude Sonnet)** as the primary pair: scaffolded
  the TanStack Start app, the dashboard UI, the Postgres schema + RLS, the
  Discord interactions endpoint, and the command-registration endpoint.
- **Google Gemini 2.5 Flash Lite** via the Lovable AI Gateway is used at
  *runtime* inside the bot itself to triage `/report` text into a tag
  (`bug|feature|question|outage|spam|other`) plus a one-line summary.
- I wrote the architecture, the data model, and the security posture.
  The agent wrote most of the boilerplate (components, RLS scaffolding,
  Recharts pages) and the first draft of the Ed25519 verifier.

## Three decisions I made myself

1. **TanStack Start on Cloudflare Workers, not Node/Express.** The exercise
   asks for a free deployment with a publicly reachable URL. Workers give me
   that immediately, with global edge latency, and the same framework hosts
   the dashboard and the webhook so I only ship one bundle. `tweetnacl` is
   pure JS and runs unmodified on the Worker.
2. **Dedup at the database, not in code.** A `UNIQUE` index on
   `interactions.interaction_id` plus an `insert().select()`-style check turns
   replay protection into a 1-line invariant that survives restarts, race
   conditions, and parallel workers. App-level "have I seen this id" caches
   would have been wrong on the first cold start.
3. **Auth is Supabase Auth, RLS is the perimeter.** First sign-up becomes
   `admin` via a trigger; every table has RLS enabled; the webhook writes
   through the service-role client only inside the route handler. The
   browser never sees the service key or the bot token.

## The single hardest wrong turn

The agent initially "verified" the request body by JSON-parsing it first
and then signing the re-serialized form. Discord's signature is over the
**exact raw bytes** Discord sent — re-serializing reorders keys and changes
whitespace, so every PING failed and Discord refused the endpoint. I caught
it because the Dev Portal stayed stuck on "Failed to validate URL" even
though my local unit test passed (I was unit-testing the re-serialized
shape too — same bug). Fix: read `await request.text()` first, verify
against that raw string, and only `JSON.parse` it afterward for routing.

The lesson generalizes: every webhook signature scheme (Stripe, GitHub,
Slack, Discord) is computed over the raw body. If your framework parses
JSON before your handler sees it, you have already lost.

## With more time

- **Per-guild mirror webhooks.** The schema already stores them; the
  endpoint currently falls back to a single env webhook for simplicity.
- **Deferred interaction responses (type 5).** Wire AI through the deferred
  path so a slow LLM never threatens the 3-second deadline.
- **Outbound retry queue** for mirror failures (transactional outbox →
  pg_cron worker) instead of recording `mirrored=false` and moving on.
- **Modals for `/report`** so the AI gets richer structured input
  (severity, area).
- **Workspace OAuth** instead of pasting a guild id — let admins click
  "Add to Discord" and we capture the install grant.
