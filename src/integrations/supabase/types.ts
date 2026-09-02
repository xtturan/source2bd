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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      abuse_blocks: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          reason: string | null
          subject: string
          subject_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          reason?: string | null
          subject: string
          subject_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          reason?: string | null
          subject?: string
          subject_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      activity_log: {
        Row: {
          allowed: boolean
          created_at: string
          detail: string | null
          id: string
          ip: string | null
          kind: string
          reason: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          allowed?: boolean
          created_at?: string
          detail?: string | null
          id?: string
          ip?: string | null
          kind: string
          reason?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          allowed?: boolean
          created_at?: string
          detail?: string | null
          id?: string
          ip?: string | null
          kind?: string
          reason?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      daily_usage: {
        Row: {
          created_at: string
          day: string
          id: string
          updated_at: string
          used: number
          visitor_key: string
        }
        Insert: {
          created_at?: string
          day: string
          id?: string
          updated_at?: string
          used?: number
          visitor_key: string
        }
        Update: {
          created_at?: string
          day?: string
          id?: string
          updated_at?: string
          used?: number
          visitor_key?: string
        }
        Relationships: []
      }
      device_accounts: {
        Row: {
          created_at: string
          device_hash: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_hash: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_hash?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      product_cache: {
        Row: {
          created_at: string
          hits: number
          id: string
          marketplace: string
          payload: Json
          product_id: string
          source_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          hits?: number
          id?: string
          marketplace: string
          payload: Json
          product_id: string
          source_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          hits?: number
          id?: string
          marketplace?: string
          payload?: Json
          product_id?: string
          source_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          signup_method: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          signup_method?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          signup_method?: string
          updated_at?: string
        }
        Relationships: []
      }
      search_cache: {
        Row: {
          created_at: string
          hits: number
          id: string
          item_count: number
          marketplace: string
          page: number
          query: string
          results: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          hits?: number
          id?: string
          item_count?: number
          marketplace: string
          page?: number
          query: string
          results: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          hits?: number
          id?: string
          item_count?: number
          marketplace?: string
          page?: number
          query?: string
          results?: Json
          updated_at?: string
        }
        Relationships: []
      }
      system_errors: {
        Row: {
          created_at: string
          detail: string | null
          id: string
          message: string
          scope: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          detail?: string | null
          id?: string
          message: string
          scope: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          detail?: string | null
          id?: string
          message?: string
          scope?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_burst_log: {
        Row: {
          action: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_daily_usage: {
        Row: {
          created_at: string
          day: string
          detail_count: number
          id: string
          link_count: number
          search_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day: string
          detail_count?: number
          id?: string
          link_count?: number
          search_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          day?: string
          detail_count?: number
          id?: string
          link_count?: number
          search_count?: number
          updated_at?: string
          user_id?: string
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
      consume_daily_usage: {
        Args: {
          _cost: number
          _day: string
          _limit: number
          _visitor_key: string
        }
        Returns: {
          allowed: boolean
          used: number
        }[]
      }
      consume_user_usage: {
        Args: {
          _action: string
          _burst_limit?: number
          _cost: number
          _day: string
          _limit: number
          _user_id: string
        }
        Returns: {
          allowed: boolean
          reason: string
          used: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_blocked: { Args: { _ip: string; _user_id: string }; Returns: boolean }
      read_user_usage: {
        Args: { _day: string; _user_id: string }
        Returns: {
          detail_count: number
          link_count: number
          search_count: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user"],
    },
  },
} as const
