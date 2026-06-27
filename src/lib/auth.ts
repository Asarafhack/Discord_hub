// Real session backed by Supabase Auth, kept API-compatible with the old mock.
import { supabase } from "@/integrations/supabase/client";

export interface Session {
  email: string;
  name: string;
  role: "admin" | "member";
  token: string;
  exp: number;
}

const CACHE_KEY = "dcc.session.v2";

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Session;
    if (s.exp < Date.now()) return null;
    return s;
  } catch {
    return null;
  }
}

async function loadRole(userId: string): Promise<"admin" | "member"> {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  return data?.some((r) => r.role === "admin") ? "admin" : "member";
}

export async function hydrateSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  const s = data.session;
  if (!s?.user) {
    if (typeof window !== "undefined") window.localStorage.removeItem(CACHE_KEY);
    return null;
  }
  const role = await loadRole(s.user.id);
  const sess: Session = {
    email: s.user.email ?? "",
    name: (s.user.user_metadata?.name as string) || (s.user.email?.split("@")[0] ?? "Operator"),
    role,
    token: s.access_token,
    exp: (s.expires_at ?? Math.floor(Date.now() / 1000) + 3600) * 1000,
  };
  if (typeof window !== "undefined") window.localStorage.setItem(CACHE_KEY, JSON.stringify(sess));
  return sess;
}

export async function signInWithPassword(email: string, password: string): Promise<Session> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) throw error ?? new Error("Sign in failed");
  const s = await hydrateSession();
  if (!s) throw new Error("Session hydration failed");
  return s;
}

export async function signUpWithPassword(email: string, password: string, name?: string): Promise<Session> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name: name ?? email.split("@")[0] }, emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined },
  });
  if (error) throw error;
  if (!data.session) {
    // Email confirmation may be required. Try immediate sign-in (auto-confirm enabled in this project).
    return await signInWithPassword(email, password);
  }
  const s = await hydrateSession();
  if (!s) throw new Error("Session hydration failed");
  return s;
}

export async function signOut() {
  await supabase.auth.signOut();
  if (typeof window !== "undefined") window.localStorage.removeItem(CACHE_KEY);
}

export function passwordStrength(pw: string): { score: 0 | 1 | 2 | 3 | 4; label: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["Too short", "Weak", "Fair", "Strong", "Excellent"];
  return { score: score as 0 | 1 | 2 | 3 | 4, label: labels[score] };
}
