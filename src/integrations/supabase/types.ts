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
      creator_social_links: {
        Row: {
          chaturbate: string | null
          creator_id: string
          instagram: string | null
          reddit: string | null
          tiktok: string | null
          twitter: string | null
          youtube: string | null
        }
        Insert: {
          chaturbate?: string | null
          creator_id: string
          instagram?: string | null
          reddit?: string | null
          tiktok?: string | null
          twitter?: string | null
          youtube?: string | null
        }
        Update: {
          chaturbate?: string | null
          creator_id?: string
          instagram?: string | null
          reddit?: string | null
          tiktok?: string | null
          twitter?: string | null
          youtube?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_social_links_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: true
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_tags: {
        Row: {
          creator_id: string
          tag: string
        }
        Insert: {
          creator_id: string
          tag: string
        }
        Update: {
          creator_id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_tags_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_team_members: {
        Row: {
          creator_id: string
          team_member_id: string
        }
        Insert: {
          creator_id: string
          team_member_id: string
        }
        Update: {
          creator_id?: string
          team_member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_team_members_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_team_members_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_telegram_groups: {
        Row: {
          created_at: string | null
          creator_id: string | null
          id: string
          team_member_id: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id?: string | null
          id?: string
          team_member_id?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string | null
          id?: string
          team_member_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_telegram_groups_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_telegram_groups_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      creators: {
        Row: {
          created_at: string | null
          creator_type: Database["public"]["Enums"]["creator_type"]
          email: string | null
          gender: Database["public"]["Enums"]["gender"]
          id: string
          name: string
          needs_review: boolean | null
          notes: string | null
          profile_image: string | null
          team: Database["public"]["Enums"]["team"]
          telegram_username: string | null
          updated_at: string | null
          whatsapp_number: string | null
        }
        Insert: {
          created_at?: string | null
          creator_type: Database["public"]["Enums"]["creator_type"]
          email?: string | null
          gender: Database["public"]["Enums"]["gender"]
          id: string
          name: string
          needs_review?: boolean | null
          notes?: string | null
          profile_image?: string | null
          team: Database["public"]["Enums"]["team"]
          telegram_username?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          created_at?: string | null
          creator_type?: Database["public"]["Enums"]["creator_type"]
          email?: string | null
          gender?: Database["public"]["Enums"]["gender"]
          id?: string
          name?: string
          needs_review?: boolean | null
          notes?: string | null
          profile_image?: string | null
          team?: Database["public"]["Enums"]["team"]
          telegram_username?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          department: string | null
          email: string
          id: string
          last_login: string | null
          name: string
          pending_telegram: boolean | null
          profile_image: string | null
          role: string
          status: string
          telegram: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          email: string
          id: string
          last_login?: string | null
          name: string
          pending_telegram?: boolean | null
          profile_image?: string | null
          role: string
          status?: string
          telegram?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          email?: string
          id?: string
          last_login?: string | null
          name?: string
          pending_telegram?: boolean | null
          profile_image?: string | null
          role?: string
          status?: string
          telegram?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      secure_area_passwords: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          password_hash: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          password_hash: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          password_hash?: string
        }
        Relationships: []
      }
      team_assignments: {
        Row: {
          created_at: string | null
          profile_id: string
          team_id: string
        }
        Insert: {
          created_at?: string | null
          profile_id: string
          team_id: string
        }
        Update: {
          created_at?: string | null
          profile_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_assignments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_assignments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          id: string
          team_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          team_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          team_name?: string
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
      creator_type: "Real" | "AI"
      gender: "Male" | "Female" | "Trans" | "AI"
      team: "A Team" | "B Team" | "C Team"
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
      creator_type: ["Real", "AI"],
      gender: ["Male", "Female", "Trans", "AI"],
      team: ["A Team", "B Team", "C Team"],
    },
  },
} as const
