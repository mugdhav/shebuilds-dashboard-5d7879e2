import { useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";

// Email of the admin Supabase Auth user — not a secret.
const ADMIN_EMAIL = "admin@shebuilds.com";

interface Props {
  children: ReactNode;
}

export function AdminAuthGuard({ children }: Props) {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [signing, setSigning] = useState(false);

  // Restore existing Supabase session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthed(!!session);
      setLoading(false);
    });
  }, []);

  if (loading) return null;
  if (authed) return <>{children}</>;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSigning(true);
    setError("");
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password,
    });
    if (authError) {
      setError("Incorrect password.");
      setPassword("");
    } else {
      setAuthed(true);
    }
    setSigning(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 via-black to-black">
      <Card className="w-full max-w-sm bg-black/60 border border-white/10 text-white">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-900/50">
            <Lock className="h-6 w-6 text-purple-300" />
          </div>
          <CardTitle className="text-white">Admin Access</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
            />
            {error && <p className="text-sm text-rose-400">{error}</p>}
            <Button
              type="submit"
              disabled={signing || !password}
              className="w-full bg-purple-700 hover:bg-purple-600 text-white"
            >
              {signing ? "Checking…" : "Enter"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
