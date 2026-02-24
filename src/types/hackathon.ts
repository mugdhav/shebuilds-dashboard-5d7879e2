import type { Database } from "@/integrations/supabase/types";

export type Participant = Database["public"]["Tables"]["participants"]["Row"];
export type Activity = Database["public"]["Tables"]["activities"]["Row"];
export type Topic = Database["public"]["Tables"]["topics"]["Row"];
export type Submission = Database["public"]["Tables"]["submissions"]["Row"];
export type HackathonSettings = Database["public"]["Tables"]["hackathon_settings"]["Row"];
