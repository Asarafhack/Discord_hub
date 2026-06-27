import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Field } from "./login";
import { Lock, ShieldCheck } from "lucide-react";
import { passwordStrength } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Set a new password — Command Center" }] }),
  component: Reset,
});

function Reset() {
  const nav = useNavigate();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const strength = useMemo(() => passwordStrength(pw), [pw]);
  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a strong password you don't use elsewhere."
      footer={<Link to="/login" className="text-primary hover:underline">Back to sign in</Link>}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (pw !== pw2) { toast.error("Passwords don't match"); return; }
          if (strength.score < 2) { toast.error("Password too weak"); return; }
          toast.success("Password updated");
          nav({ to: "/login" });
        }}
        className="grid gap-4"
      >
        <Field icon={Lock} label="New password" type="password" value={pw} onChange={setPw} />
        <Field icon={Lock} label="Confirm password" type="password" value={pw2} onChange={setPw2} />
        <p className="text-xs text-muted-foreground">Strength: <span className="text-foreground">{strength.label}</span></p>
        <button className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
          <ShieldCheck className="h-4 w-4" /> Update password
        </button>
      </form>
    </AuthShell>
  );
}
