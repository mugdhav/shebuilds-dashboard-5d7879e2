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

  // Try to find existing admin user
  const { data: { users } } = await db.auth.admin.listUsers();
  const admin = users?.find((u: any) => u.email === "admin@shebuilds.com");

  if (admin) {
    // Update password
    const { error } = await db.auth.admin.updateUserById(admin.id, {
      password: "sh3Bui1d$",
    });
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: cors });
    return new Response(JSON.stringify({ ok: true, message: "Password updated for existing user" }), { headers: { ...cors, "Content-Type": "application/json" } });
  } else {
    // Create admin user
    const { error } = await db.auth.admin.createUser({
      email: "admin@shebuilds.com",
      password: "sh3Bui1d$",
      email_confirm: true,
    });
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: cors });
    return new Response(JSON.stringify({ ok: true, message: "Admin user created with password" }), { headers: { ...cors, "Content-Type": "application/json" } });
  }
});
