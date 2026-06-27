import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { signInWithPassword } from "@/lib/auth";
import { AuthShell } from "@/components/auth-shell";
import { Loader2, Mail, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Command Center" }, { name: "description", content: "Sign in to your Discord Command Center dashboard." }] }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your Command Center account."
      footer={<>Don't have an account? <Link to="/register" className="text-primary hover:underline">Create one</Link></>}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          try {
            await signInWithPassword(email, password);
            toast.success("Signed in");
            nav({ to: "/app" });
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Sign in failed");
          } finally {
            setLoading(false);
          }
        }}
        className="grid gap-4"
      >
        <Field icon={Mail} label="Email" type="email" value={email} onChange={setEmail} placeholder="you@team.dev" />
        <Field icon={Lock} label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-muted-foreground"><input type="checkbox" defaultChecked className="accent-primary" />Remember me</label>
          <Link to="/forgot-password" className="text-primary hover:underline">Forgot password?</Link>
        </div>
        <button disabled={loading} className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          Sign in securely
        </button>
        <p className="text-center text-xs text-muted-foreground">The first user to register is granted admin automatically.</p>
      </form>
    </AuthShell>
  );
}

export function Field({ icon: Icon, label, type, value, onChange, placeholder }: { icon: React.ComponentType<{ className?: string }>; label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2.5 focus-within:border-primary">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <input
          type={type ?? "text"}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
          required
        />
      </div>
    </label>
  );
}
