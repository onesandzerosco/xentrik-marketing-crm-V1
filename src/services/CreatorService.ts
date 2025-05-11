
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
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
      
      // Insert the creator into the database - without specifying the id
      // Use TablesInsert to ensure type safety
      const { error } = await supabase
        .from('creators')
        .insert({
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
          model_profile: creatorData.modelProfile || null
        } as TablesInsert<"creators">);
      
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
      // Extract basic required fields
      const name = formData.name || formData.personalInfo?.fullName || "New Creator";
      const gender = formData.gender || formData.personalInfo?.sex || "Female";
      const teamValue = formData.team || "A Team";
      const creatorTypeValue = formData.creatorType || "Real";
      
      // Insert without specifying an ID
      const { error } = await supabase
        .from('creators')
        .insert({
          name,
          gender,
          team: teamValue,
          creator_type: creatorTypeValue,
          needs_review: true,
          active: true,
          model_profile: formData 
        } as TablesInsert<"creators">);
      
      if (error) {
        console.error("Error saving onboarding data:", error);
        throw error;
      }
      
      // Return a placeholder ID for now - actual ID will be generated upon approval
      return "pending";
    } catch (error) {
      console.error("Error in saveOnboardingData:", error);
      return undefined;
    }
  }
  
  /**
   * Accept a creator onboarding submission
   * @param formData The onboarding form data 
   * @param creatorInfo The basic creator information to save
   * @returns The new creator ID or undefined on error
   */
  static async acceptOnboardingSubmission(
    formData: any, 
    creatorInfo: {
      name: string;
      team: "A" | "B" | "C";
      creatorType: "AI" | "Real";
    }
  ): Promise<string | undefined> {
    try {
      // Map personal info from the form data
      const personalInfo = formData.personalInfo || {};
      
      // Map the gender value from the onboarding form to our database enum
      let genderValue: "Male" | "Female" | "Trans" | "AI" = "Female";
      
      if (personalInfo.sex === "Male") {
        genderValue = "Male";
      } else if (personalInfo.sex === "Female") {
        genderValue = "Female";
      } else if (personalInfo.sex === "Transgender") {
        genderValue = "Trans";
      }
      
      // Create basic creator data with the admin-specified values
      const creatorData = {
        name: creatorInfo.name,
        email: personalInfo.email || null,
        gender: genderValue,
        team: creatorInfo.team,
        creatorType: creatorInfo.creatorType,
        sex: personalInfo.sex || null,
        notes: personalInfo.notes || null,
        telegramUsername: personalInfo.telegramUsername || null,
        whatsappNumber: personalInfo.whatsappNumber || null,
        // Store the full form data as model_profile
        modelProfile: formData
      };
      
      console.log("Creating creator with data:", creatorData);
      
      // Add creator to database
      const creatorId = await this.addCreator(creatorData);
      
      if (!creatorId) {
        throw new Error("Failed to create creator record");
      }
      
      return creatorId;
    } catch (error) {
      console.error("Error accepting submission:", error);
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
      
      // Create creator record with the user's ID
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
        } as TablesInsert<"creators">);
      
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
