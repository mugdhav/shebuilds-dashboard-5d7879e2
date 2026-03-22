import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const db = createClient(SUPABASE_URL, SERVICE_KEY);

  // Find the admin user
  const { data: { users }, error: listErr } = await db.auth.admin.listUsers();
  if (listErr) return new Response(JSON.stringify({ error: listErr.message }), { status: 500, headers: cors });

  const admin = users?.find((u: any) => u.email === "admin@shebuilds.com");
  if (!admin) return new Response(JSON.stringify({ error: "Admin user not found" }), { status: 404, headers: cors });

  // Update password
  const { error: updateErr } = await db.auth.admin.updateUserById(admin.id, {
    password: "sh3Bui1d$",
  });

  if (updateErr) return new Response(JSON.stringify({ error: updateErr.message }), { status: 500, headers: cors });

  return new Response(JSON.stringify({ ok: true, message: "Password updated" }), { headers: { ...cors, "Content-Type": "application/json" } });
});
