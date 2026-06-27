import { createFileRoute } from "@tanstack/react-router";
import { Avatar, Card, CardHeader, PageHeader } from "@/components/app-shell";
import { getSession } from "@/lib/auth";

export const Route = createFileRoute("/app/profile")({
  head: () => ({ meta: [{ title: "Profile — Command Center" }] }),
  component: Profile,
});

function Profile() {
  const s = typeof window !== "undefined" ? getSession() : null;
  return (
    <div>
      <PageHeader title="Profile" description="Your personal information visible to your team." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="h-20 w-20"><Avatar name={s?.name || s?.email || "Operator"} /></div>
            <div className="mt-4 text-lg font-semibold">{s?.name || "Operator"}</div>
            <div className="text-xs text-muted-foreground">{s?.email}</div>
            <span className="mt-2 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-primary">{s?.role}</span>
            <button className="mt-6 w-full rounded-md border border-border px-3 py-2 text-xs hover:bg-accent/10">Upload avatar</button>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Personal information" />
          <div className="grid gap-4 p-5 md:grid-cols-2">
            <Field label="Display name" defaultValue={s?.name || ""} />
            <Field label="Email" defaultValue={s?.email || ""} />
            <Field label="Timezone" defaultValue="UTC" />
            <Field label="Role" defaultValue={s?.role || "member"} />
            <Field label="Discord ID" defaultValue="442918374019283740" />
            <Field label="Phone" defaultValue="" placeholder="+1 …" />
          </div>
          <div className="border-t border-border p-5">
            <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Save changes</button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, defaultValue, placeholder }: { label: string; defaultValue?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input defaultValue={defaultValue} placeholder={placeholder} className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
    </label>
  );
}
