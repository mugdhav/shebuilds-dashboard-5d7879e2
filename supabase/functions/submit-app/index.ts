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

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const { full_name, email, app_name, app_topic, app_link } = body;

  // ── Server-side validation ────────────────────────────────────────────────
  if (!full_name?.trim() || full_name.trim().length < 2)
    return json({ error: "Full name must be at least 2 characters" }, 400);
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return json({ error: "Please enter a valid email address" }, 400);
  if (!app_name?.trim())
    return json({ error: "App name is required" }, 400);
  if (app_name.trim().length > 25)
    return json({ error: "App name must be 25 characters or less" }, 400);
  if (app_topic?.trim() && app_topic.trim().length > 25)
    return json({ error: "App topic must be 25 characters or less" }, 400);
  if (app_link?.trim() && !/^https?:\/\//i.test(app_link.trim()))
    return json({ error: "App link must start with http:// or https://" }, 400);

  const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    // ── Dedup check ───────────────────────────────────────────────────────────
    const { data: existing } = await db
      .from("submissions")
      .select("id")
      .eq("email", email.trim())
      .limit(1);

    const isNew = !existing || existing.length === 0;

    if (isNew) {
      const { error } = await db.from("submissions").insert({
        full_name: full_name.trim(),
        email: email.trim(),
        app_name: app_name.trim(),
        app_topic: app_topic?.trim() || null,
        app_link: app_link?.trim() || null,
      });
      if (error) throw error;

      // Activity only posted on first submission
      await db.from("activities").insert({
        participant_name: full_name.trim(),
        action: `submitted "${app_name.trim()}"`,
        emoji: "🏆",
      });
    } else {
      const { error } = await db
        .from("submissions")
        .update({
          full_name: full_name.trim(),
          app_name: app_name.trim(),
          app_topic: app_topic?.trim() || null,
          app_link: app_link?.trim() || null,
        })
        .eq("email", email.trim());
      if (error) throw error;
    }

    // ── Auto-create topic if it doesn't exist ─────────────────────────────────
    if (app_topic?.trim()) {
      const { data: existingTopic } = await db
        .from("topics")
        .select("id")
        .ilike("name", app_topic.trim())
        .limit(1);

      if (!existingTopic || existingTopic.length === 0) {
        await db.from("topics").insert({ name: app_topic.trim() });
      }
    }

    return json({ ok: true, isNew });
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
});
