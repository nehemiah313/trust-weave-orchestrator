export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      agent_dialogues: {
        Row: {
          id: string
          message: Json
          source_agent_id: string | null
          target_agent_id: string | null
          task_id: string | null
          timestamp: string
        }
        Insert: {
          id?: string
          message: Json
          source_agent_id?: string | null
          target_agent_id?: string | null
          task_id?: string | null
          timestamp?: string
        }
        Update: {
          id?: string
          message?: Json
          source_agent_id?: string | null
          target_agent_id?: string | null
          task_id?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_dialogues_source_agent_id_fkey"
            columns: ["source_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_dialogues_target_agent_id_fkey"
            columns: ["target_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_dialogues_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          capabilities: Json | null
          created_at: string
          id: string
          is_active: boolean
          last_active: string | null
          metadata: Json | null
          name: string
          protocol: Database["public"]["Enums"]["agent_protocol"]
          trust_score: number
          updated_at: string
        }
        Insert: {
          capabilities?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          last_active?: string | null
          metadata?: Json | null
          name: string
          protocol: Database["public"]["Enums"]["agent_protocol"]
          trust_score?: number
          updated_at?: string
        }
        Update: {
          capabilities?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          last_active?: string | null
          metadata?: Json | null
          name?: string
          protocol?: Database["public"]["Enums"]["agent_protocol"]
          trust_score?: number
          updated_at?: string
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          key_hash: string
          last_used: string | null
          scope: string[] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_hash: string
          last_used?: string | null
          scope?: string[] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_hash?: string
          last_used?: string | null
          scope?: string[] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action_type: Database["public"]["Enums"]["action_type"]
          agent_id: string | null
          id: string
          ip_address: unknown | null
          payload: Json | null
          resource: string
          task_id: string | null
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_type: Database["public"]["Enums"]["action_type"]
          agent_id?: string | null
          id?: string
          ip_address?: unknown | null
          payload?: Json | null
          resource: string
          task_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: Database["public"]["Enums"]["action_type"]
          agent_id?: string | null
          id?: string
          ip_address?: unknown | null
          payload?: Json | null
          resource?: string
          task_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_events: {
        Row: {
          agent_id: string | null
          amount: number
          currency: string
          fee_type: Database["public"]["Enums"]["fee_type"]
          id: string
          metadata: Json | null
          task_id: string | null
          timestamp: string
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          amount: number
          currency?: string
          fee_type: Database["public"]["Enums"]["fee_type"]
          id?: string
          metadata?: Json | null
          task_id?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          amount?: number
          currency?: string
          fee_type?: Database["public"]["Enums"]["fee_type"]
          id?: string
          metadata?: Json | null
          task_id?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_events_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_events_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          agent_id: string | null
          assigned_at: string | null
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          input_data: Json
          output_data: Json | null
          status: Database["public"]["Enums"]["task_status"]
          task_type: Database["public"]["Enums"]["task_type"]
          trust_score_delta: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          assigned_at?: string | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_data?: Json
          output_data?: Json | null
          status?: Database["public"]["Enums"]["task_status"]
          task_type: Database["public"]["Enums"]["task_type"]
          trust_score_delta?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          assigned_at?: string | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_data?: Json
          output_data?: Json | null
          status?: Database["public"]["Enums"]["task_status"]
          task_type?: Database["public"]["Enums"]["task_type"]
          trust_score_delta?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      trust_events: {
        Row: {
          agent_id: string | null
          created_at: string
          delta: number
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          metadata: Json | null
          reason: string | null
          task_id: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          delta: number
          event_type: Database["public"]["Enums"]["event_type"]
          id?: string
          metadata?: Json | null
          reason?: string | null
          task_id?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          delta?: number
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          metadata?: Json | null
          reason?: string | null
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trust_events_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_events_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
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
      action_type:
        | "create"
        | "read"
        | "update"
        | "delete"
        | "execute"
        | "delegate"
      agent_protocol: "nlweb" | "mcp" | "a2a"
      event_type:
        | "performance"
        | "error"
        | "security"
        | "compliance"
        | "timeout"
      fee_type:
        | "per_task"
        | "compliance"
        | "routing"
        | "verification"
        | "premium"
      task_status:
        | "pending"
        | "assigned"
        | "in_progress"
        | "completed"
        | "failed"
        | "cancelled"
      task_type:
        | "nlp_processing"
        | "data_analysis"
        | "coordination"
        | "verification"
        | "custom"
      user_role: "admin" | "enterprise" | "developer" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      action_type: [
        "create",
        "read",
        "update",
        "delete",
        "execute",
        "delegate",
      ],
      agent_protocol: ["nlweb", "mcp", "a2a"],
      event_type: ["performance", "error", "security", "compliance", "timeout"],
      fee_type: [
        "per_task",
        "compliance",
        "routing",
        "verification",
        "premium",
      ],
      task_status: [
        "pending",
        "assigned",
        "in_progress",
        "completed",
        "failed",
        "cancelled",
      ],
      task_type: [
        "nlp_processing",
        "data_analysis",
        "coordination",
        "verification",
        "custom",
      ],
      user_role: ["admin", "enterprise", "developer", "user"],
    },
  },
} as const
