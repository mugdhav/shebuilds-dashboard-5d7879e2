import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://fhyuvjznkaklefkxvgse.supabase.co";
const EDGE_URL = `${SUPABASE_URL}/functions/v1/admin-mutations`;

export async function adminApi(operation: string, payload: unknown): Promise<any> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated. Please reload and log in.");

  const res = await fetch(EDGE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ operation, payload }),
  });

  let json: any;
  try {
    json = await res.json();
  } catch {
    throw new Error(`Admin request failed (${res.status}): unexpected response format`);
  }

  if (!res.ok) throw new Error(json.error ?? `Admin request failed (${res.status})`);
  return json.data;
}
