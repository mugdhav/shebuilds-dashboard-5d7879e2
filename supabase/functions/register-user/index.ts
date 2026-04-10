import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const { full_name, email } = body as { full_name?: string; email?: string };

  // ── Validation ────────────────────────────────────────────────────────────
  if (!full_name?.trim() || full_name.trim().length < 2)
    return json({ error: "Full name must be at least 2 characters" }, 400);
  if (full_name.trim().length > 100)
    return json({ error: "Full name must be 100 characters or less" }, 400);
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return json({ error: "Please enter a valid email address" }, 400);
  if (email.trim().length > 255)
    return json({ error: "Email must be 255 characters or less" }, 400);

  const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    // ── Check for existing registration ───────────────────────────────────
    const { data: existing } = await db
      .from("registrations")
      .select("id")
      .eq("email", email.trim())
      .limit(1);

    if (existing && existing.length > 0) {
      return json({ error: "This email is already registered" }, 409);
    }

    // ── Insert registration ───────────────────────────────────────────────
    const { error } = await db.from("registrations").insert({
      full_name: full_name.trim(),
      email: email.trim(),
    });
    if (error) throw error;

    return json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return json({ error: message }, 500);
  }
});
