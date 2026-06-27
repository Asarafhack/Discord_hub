import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { signUpWithPassword, passwordStrength } from "@/lib/auth";
import { AuthShell } from "@/components/auth-shell";
import { Field } from "./login";
import { User, Mail, Lock, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create your account — Command Center" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const strength = useMemo(() => passwordStrength(pw), [pw]);
  const colors = ["bg-muted","bg-destructive","bg-warning","bg-info","bg-success"];

  return (
    <AuthShell
      title="Create your account"
      subtitle="Free forever. No credit card required."
      footer={<>Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link></>}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (strength.score < 2) { toast.error("Please choose a stronger password."); return; }
          setLoading(true);
          try {
            await signUpWithPassword(email, pw, name);
            toast.success("Account created");
            nav({ to: "/app" });
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Sign up failed");
          } finally {
            setLoading(false);
          }
        }}
        className="grid gap-4"
      >
        <Field icon={User} label="Full name" value={name} onChange={setName} placeholder="Ada Lovelace" />
        <Field icon={Mail} label="Email" type="email" value={email} onChange={setEmail} placeholder="you@team.dev" />
        <Field icon={Lock} label="Password" type="password" value={pw} onChange={setPw} placeholder="At least 8 characters" />
        <div>
          <div className="flex gap-1">
            {[0,1,2,3].map((i) => (
              <div key={i} className={`h-1 flex-1 rounded-full ${i < strength.score ? colors[strength.score] : "bg-muted"}`} />
            ))}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">Strength: <span className="text-foreground">{strength.label}</span></p>
        </div>
        <button disabled={loading} className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          Create account
        </button>
      </form>
    </AuthShell>
  );
}
