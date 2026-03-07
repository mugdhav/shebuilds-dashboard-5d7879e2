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

  // ── Auth: validate Supabase JWT ──────────────────────────────────────────────
  const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
  if (!token) return json({ error: "Unauthorized" }, 401);

  const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const { data: { user }, error: authError } = await db.auth.getUser(token);
  if (authError || !user) return json({ error: "Unauthorized" }, 401);

  // ── Parse body ───────────────────────────────────────────────────────────────
  let operation: string, payload: any;
  try {
    ({ operation, payload } = await req.json());
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  let result: any = null;

  try {
    switch (operation) {

      // ── participants ─────────────────────────────────────────────────────────

      case "participants.delete": {
        const { error } = await db.from("participants").delete().eq("id", payload.id);
        if (error) throw error;
        break;
      }

      case "participants.spotlight": {
        const { error: e1 } = await db.from("participants")
          .update({ is_spotlight: false }).eq("is_spotlight", true);
        if (e1) throw e1;
        const { error: e2 } = await db.from("participants")
          .update({ is_spotlight: true }).eq("id", payload.id);
        if (e2) throw e2;
        break;
      }

      case "participants.update_with_activity": {
        const { id, data, autoActivity } = payload;
        if (autoActivity) {
          await db.from("activities").insert(autoActivity);
        }
        const { error } = await db.from("participants").update(data).eq("id", id);
        if (error) throw error;
        break;
      }

      // Bulk CSV import — dedup by email server-side, then update participant count
      case "participants.import": {
        const { rows, settingsId, currentCount } = payload;
        let imported = 0, skipped = 0;

        for (const row of rows) {
          if (row.email) {
            const { data: existing } = await db.from("participants")
              .select("id").eq("email", row.email).limit(1);
            if (existing && existing.length > 0) { skipped++; continue; }
          }
          const { error } = await db.from("participants").insert(row);
          if (!error) imported++; else skipped++;
        }

        if (imported > 0 && settingsId) {
          await db.from("hackathon_settings").update({
            active_participants: currentCount + imported,
            is_using_demo_data: false,
          }).eq("id", settingsId);
        }

        result = { imported, skipped };
        break;
      }

      // ── activities ───────────────────────────────────────────────────────────

      case "activities.insert": {
        const { data, error } = await db.from("activities").insert(payload).select();
        if (error) throw error;
        result = data;
        break;
      }

      case "activities.delete": {
        const { error } = await db.from("activities").delete().eq("id", payload.id);
        if (error) throw error;
        break;
      }

      // ── topics ───────────────────────────────────────────────────────────────

      case "topics.insert": {
        const { data, error } = await db.from("topics").insert(payload).select();
        if (error) throw error;
        result = data;
        break;
      }

      case "topics.delete": {
        const { error } = await db.from("topics").delete().eq("id", payload.id);
        if (error) throw error;
        break;
      }

      // ── hackathon_settings ───────────────────────────────────────────────────

      case "settings.update": {
        const { id, data } = payload;
        const { error } = await db.from("hackathon_settings").update(data).eq("id", id);
        if (error) throw error;
        break;
      }

      default:
        return json({ error: `Unknown operation: ${operation}` }, 400);
    }

    return json({ ok: true, data: result });
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
});
