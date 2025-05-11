
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";
import { CreatorAddService } from "./CreatorAddService";

/**
 * Service for handling creator onboarding
 */
export class OnboardingService {
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
      const creatorId = await CreatorAddService.addCreator(creatorData);
      
      if (!creatorId) {
        throw new Error("Failed to create creator record");
      }
      
      return creatorId;
    } catch (error) {
      console.error("Error accepting submission:", error);
      return undefined;
    }
  }
}
