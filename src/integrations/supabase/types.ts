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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          created_at: string
          departure_id: string
          due_date: string
          id: string
          notes: string
          source: Database["public"]["Enums"]["task_source"]
          status: Database["public"]["Enums"]["activity_status"]
          template_code: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          departure_id: string
          due_date: string
          id?: string
          notes?: string
          source?: Database["public"]["Enums"]["task_source"]
          status?: Database["public"]["Enums"]["activity_status"]
          template_code: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          departure_id?: string
          due_date?: string
          id?: string
          notes?: string
          source?: Database["public"]["Enums"]["task_source"]
          status?: Database["public"]["Enums"]["activity_status"]
          template_code?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_departure_id_fkey"
            columns: ["departure_id"]
            isOneToOne: false
            referencedRelation: "departures"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_templates: {
        Row: {
          code: string
          created_at: string
          critical: boolean
          id: string
          name: string
          reference_date: Database["public"]["Enums"]["sla_reference_date"]
          required: boolean
          sla_offset_days: number
          source: Database["public"]["Enums"]["task_source"]
        }
        Insert: {
          code: string
          created_at?: string
          critical?: boolean
          id?: string
          name: string
          reference_date?: Database["public"]["Enums"]["sla_reference_date"]
          required?: boolean
          sla_offset_days?: number
          source?: Database["public"]["Enums"]["task_source"]
        }
        Update: {
          code?: string
          created_at?: string
          critical?: boolean
          id?: string
          name?: string
          reference_date?: Database["public"]["Enums"]["sla_reference_date"]
          required?: boolean
          sla_offset_days?: number
          source?: Database["public"]["Enums"]["task_source"]
        }
        Relationships: []
      }
      departures: {
        Row: {
          booking_count: number
          created_at: string
          date: string
          destination_code: string
          destination_id: string
          gtd: boolean
          id: string
          ji_sent_date: string | null
          notes: string
          ops_exec_id: string | null
          ops_manager_id: string | null
          pax_count: number
          return_date: string | null
          series_code: string
          series_id: string
          tour_generic: string | null
          travel_system_link: string | null
          updated_at: string
        }
        Insert: {
          booking_count?: number
          created_at?: string
          date: string
          destination_code: string
          destination_id: string
          gtd?: boolean
          id?: string
          ji_sent_date?: string | null
          notes?: string
          ops_exec_id?: string | null
          ops_manager_id?: string | null
          pax_count?: number
          return_date?: string | null
          series_code: string
          series_id: string
          tour_generic?: string | null
          travel_system_link?: string | null
          updated_at?: string
        }
        Update: {
          booking_count?: number
          created_at?: string
          date?: string
          destination_code?: string
          destination_id?: string
          gtd?: boolean
          id?: string
          ji_sent_date?: string | null
          notes?: string
          ops_exec_id?: string | null
          ops_manager_id?: string | null
          pax_count?: number
          return_date?: string | null
          series_code?: string
          series_id?: string
          tour_generic?: string | null
          travel_system_link?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departures_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departures_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      destinations: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          email: string | null
          id: string
          locale_currency: string
          locale_date_format: string | null
          locale_language: string
          locale_timezone: string
          theme_mode: string
          theme_palette: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string
          email?: string | null
          id: string
          locale_currency?: string
          locale_date_format?: string | null
          locale_language?: string
          locale_timezone?: string
          theme_mode?: string
          theme_palette?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          email?: string | null
          id?: string
          locale_currency?: string
          locale_date_format?: string | null
          locale_language?: string
          locale_timezone?: string
          theme_mode?: string
          theme_palette?: string
          updated_at?: string
        }
        Relationships: []
      }
      series: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_departure: {
        Args: { _departure_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_ops_manager: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      activity_status:
        | "not_started"
        | "in_progress"
        | "waiting"
        | "complete"
        | "overdue"
        | "not_applicable"
      app_role: "ops_manager" | "ops_exec"
      sla_reference_date: "departure" | "return" | "ji_exists"
      task_source: "GLOBAL" | "TG" | "TS" | "TD" | "CUSTOM"
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
    Enums: {
      activity_status: [
        "not_started",
        "in_progress",
        "waiting",
        "complete",
        "overdue",
        "not_applicable",
      ],
      app_role: ["ops_manager", "ops_exec"],
      sla_reference_date: ["departure", "return", "ji_exists"],
      task_source: ["GLOBAL", "TG", "TS", "TD", "CUSTOM"],
    },
  },
} as const
