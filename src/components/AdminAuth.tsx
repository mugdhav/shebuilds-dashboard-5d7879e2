import { useState, ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";

const STORAGE_KEY = "admin_authed";

async function sha256hex(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

interface Props {
  children: ReactNode;
}

export function AdminAuthGuard({ children }: Props) {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem(STORAGE_KEY) === "1"
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  if (authed) return <>{children}</>;

  const expectedHash = "ef967844421a39fa1157773bed6d54932ceddf506b918451bad55745f59d933f";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setChecking(true);
    setError("");
    try {
      const hash = await sha256hex(password);
      if (hash === expectedHash) {
        sessionStorage.setItem(STORAGE_KEY, "1");
        setAuthed(true);
      } else {
        setError("Incorrect password.");
        setPassword("");
      }
    } finally {
      setChecking(false);
    }
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
            {error && (
              <p className="text-sm text-rose-400">{error}</p>
            )}
            <Button
              type="submit"
              disabled={checking || !password}
              className="w-full bg-purple-700 hover:bg-purple-600 text-white"
            >
              {checking ? "Checking…" : "Enter"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
