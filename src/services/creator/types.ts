
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export interface CreatorData {
  name: string;
  email?: string;
  gender: "Male" | "Female" | "Trans" | "AI";
  team: string;
  creatorType: string;
  notes?: string;
  telegramUsername?: string;
  whatsappNumber?: string;
  profileImage?: string;
  sex?: string;
  modelProfile?: any; // Store onboarding form data
}
