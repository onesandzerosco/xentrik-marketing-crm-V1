
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

export interface CreatorData {
  name: string;
  email: string;
  gender: "Male" | "Female" | "Trans" | "AI";
  team: string;
  creatorType: string;
  notes?: string;
  telegramUsername?: string;
  whatsappNumber?: string;
  profileImage?: string;
  sex?: string;
  modelProfile?: any; // Add model_profile field to store onboarding form data
}

class CreatorService {
  /**
   * Add a new creator
   * @param creatorData The creator data to add
   * @returns The ID of the created creator or undefined on error
   */
  static async addCreator(creatorData: CreatorData): Promise<string | undefined> {
    try {
      // Generate a unique ID for the creator
      const creatorId = uuidv4();
      
      // Insert the creator into the database - use a single object for insert
      const { error } = await supabase
        .from('creators')
        .insert({
          id: creatorId,
          name: creatorData.name,
          email: creatorData.email,
          gender: creatorData.gender,
          team: creatorData.team,
          creator_type: creatorData.creatorType,
          notes: creatorData.notes || null,
          telegram_username: creatorData.telegramUsername || null,
          whatsapp_number: creatorData.whatsappNumber || null,
          profile_image: creatorData.profileImage || null,
          sex: creatorData.sex || null,
          needs_review: true,
          active: true,
          model_profile: creatorData.modelProfile || null // Store the full onboarding form data
        });
      
      if (error) {
        console.error("Error creating creator:", error);
        throw error;
      }
      
      return creatorId;
    } catch (error) {
      console.error("Error in addCreator:", error);
      return undefined;
    }
  }
  
  /**
   * Save onboarding form data for a creator
   * @param token The onboarding token
   * @param formData The complete onboarding form data
   * @returns The creator ID or undefined on error
   */
  static async saveOnboardingData(token: string, formData: any): Promise<string | undefined> {
    try {
      // Generate a unique ID for the creator
      const creatorId = uuidv4();
      
      // Extract basic required fields
      const name = formData.name || formData.personalInfo?.name || "New Creator";
      const gender = formData.gender || formData.personalInfo?.gender || "Female";
      const teamValue = formData.team || "A Team";
      const creatorTypeValue = formData.creatorType || "Real";
      
      // Insert the creator into the database with minimal required fields
      // But store the complete form data in model_profile
      const { error } = await supabase
        .from('creators')
        .insert({
          id: creatorId,
          name,
          gender,
          team: teamValue,
          creator_type: creatorTypeValue,
          needs_review: true,
          active: true,
          model_profile: formData // Store the entire form data as JSON
        });
      
      if (error) {
        console.error("Error saving onboarding data:", error);
        throw error;
      }
      
      return creatorId;
    } catch (error) {
      console.error("Error in saveOnboardingData:", error);
      return undefined;
    }
  }
  
  /**
   * Ensure a creator record exists for a user
   * Used when approving onboarding submissions
   * @param userId The user ID
   * @returns True if successful, false otherwise
   */
  static async ensureCreatorRecordExists(userId: string): Promise<boolean> {
    try {
      // Check if creator exists
      const { data: existingCreator } = await supabase
        .from('creators')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
      
      if (existingCreator) {
        return true;
      }
      
      // Get user profile data
      const { data: user } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not found");
      }
      
      // Create creator record - use a single object for insert
      const { error } = await supabase
        .from('creators')
        .insert({
          id: userId,
          name: user.user.user_metadata.name || user.user.email,
          email: user.user.email,
          gender: "Female", // Default
          team: "A Team", // Default
          creator_type: "Real", // Default
          needs_review: true,
          active: true
        });
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error("Error in ensureCreatorRecordExists:", error);
      return false;
    }
  }
}

export default CreatorService;
