import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Field } from "./login";
import { Mail, Send, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset your password — Command Center" }] }),
  component: ForgotPage,
});

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="We'll email you a secure reset link."
      footer={<><Link to="/login" className="text-primary hover:underline">Back to sign in</Link></>}
    >
      {sent ? (
        <div className="grid place-items-center gap-3 py-6 text-center">
          <CheckCircle2 className="h-10 w-10 text-success" />
          <p className="text-sm">Reset link sent to <span className="font-medium">{email}</span></p>
          <p className="text-xs text-muted-foreground">Check your inbox — link expires in 15 minutes.</p>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="grid gap-4">
          <Field icon={Mail} label="Email" type="email" value={email} onChange={setEmail} placeholder="you@team.dev" />
          <button className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
            <Send className="h-4 w-4" /> Send reset link
          </button>
        </form>
      )}
    </AuthShell>
  );
}
