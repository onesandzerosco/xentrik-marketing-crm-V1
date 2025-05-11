
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import type { Database } from "@/integrations/supabase/types";

// Define the enum types from Supabase
type TeamEnum = Database["public"]["Enums"]["team"]; 
type CreatorTypeEnum = Database["public"]["Enums"]["creator_type"];
type GenderEnum = Database["public"]["Enums"]["gender"];

export interface CreatorData {
  name: string;
  email?: string;
  gender: GenderEnum;
  team: TeamEnum;
  creatorType: CreatorTypeEnum;
  notes?: string;
  telegramUsername?: string;
  whatsappNumber?: string;
  profileImage?: string;
  sex?: string;
  modelProfile?: any; // Store onboarding form data
}
