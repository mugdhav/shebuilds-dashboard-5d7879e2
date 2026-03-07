import { ADMIN_HASH } from "./adminConfig";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const EDGE_URL = `${SUPABASE_URL}/functions/v1/admin-mutations`;

export async function adminApi(operation: string, payload: unknown): Promise<any> {
  const res = await fetch(EDGE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ADMIN_HASH}`,
    },
    body: JSON.stringify({ operation, payload }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? `Admin request failed (${res.status})`);
  return json.data;
}
