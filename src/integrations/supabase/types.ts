export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          action: string
          created_at: string
          emoji: string
          id: number
          participant_name: string
        }
        Insert: {
          action: string
          created_at?: string
          emoji?: string
          id?: number
          participant_name: string
        }
        Update: {
          action?: string
          created_at?: string
          emoji?: string
          id?: number
          participant_name?: string
        }
        Relationships: []
      }
      hackathon_settings: {
        Row: {
          active_participants: number
          completed_apps: number
          end_time: string
          id: number
          in_progress: number
          is_using_demo_data: boolean
          start_time: string
          submissions: number
        }
        Insert: {
          active_participants?: number
          completed_apps?: number
          end_time?: string
          id?: number
          in_progress?: number
          is_using_demo_data?: boolean
          start_time?: string
          submissions?: number
        }
        Update: {
          active_participants?: number
          completed_apps?: number
          end_time?: string
          id?: number
          in_progress?: number
          is_using_demo_data?: boolean
          start_time?: string
          submissions?: number
        }
        Relationships: []
      }
      participants: {
        Row: {
          app_topic: string | null
          avatar_color: string
          avatar_initials: string
          build_status: string | null
          checked_in: boolean
          created_at: string
          email: string | null
          id: number
          is_spotlight: boolean
          luma_guest_id: string | null
          name: string
          project_description: string | null
          project_name: string | null
          status: string
          ticket_number: string | null
        }
        Insert: {
          app_topic?: string | null
          avatar_color?: string
          avatar_initials: string
          build_status?: string | null
          checked_in?: boolean
          created_at?: string
          email?: string | null
          id?: number
          is_spotlight?: boolean
          luma_guest_id?: string | null
          name: string
          project_description?: string | null
          project_name?: string | null
          status?: string
          ticket_number?: string | null
        }
        Update: {
          app_topic?: string | null
          avatar_color?: string
          avatar_initials?: string
          build_status?: string | null
          checked_in?: boolean
          created_at?: string
          email?: string | null
          id?: number
          is_spotlight?: boolean
          luma_guest_id?: string | null
          name?: string
          project_description?: string | null
          project_name?: string | null
          status?: string
          ticket_number?: string | null
        }
        Relationships: []
      }
      registrations: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: number
          verification_token: string | null
          verified: boolean
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: never
          verification_token?: string | null
          verified?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: never
          verification_token?: string | null
          verified?: boolean
        }
        Relationships: []
      }
      submissions: {
        Row: {
          app_link: string | null
          app_name: string
          app_topic: string | null
          email: string
          full_name: string
          id: number
          submitted_at: string
        }
        Insert: {
          app_link?: string | null
          app_name: string
          app_topic?: string | null
          email: string
          full_name: string
          id?: number
          submitted_at?: string
        }
        Update: {
          app_link?: string | null
          app_name?: string
          app_topic?: string | null
          email?: string
          full_name?: string
          id?: number
          submitted_at?: string
        }
        Relationships: []
      }
      topics: {
        Row: {
          id: number
          name: string
          weight: number
        }
        Insert: {
          id?: number
          name: string
          weight?: number
        }
        Update: {
          id?: number
          name?: string
          weight?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
