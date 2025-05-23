
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";
import type { Database } from "@/integrations/supabase/types";
import { v4 as uuidv4 } from "uuid";

// Define the enum types from Supabase
type TeamEnum = Database["public"]["Enums"]["team"];
type CreatorTypeEnum = Database["public"]["Enums"]["creator_type"];
type GenderEnum = Database["public"]["Enums"]["gender"];

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
      // Extract basic required fields for the onboarding_submissions table
      const name = formData.personalInfo?.fullName || formData.name || "New Creator";
      const email = formData.personalInfo?.email || "noemail@example.com";
      
      console.log("Saving onboarding data with token:", token);
      console.log("Form data contains:", 
        Object.keys(formData).join(", "),
        "personal info fields:", 
        formData.personalInfo ? Object.keys(formData.personalInfo).join(", ") : "none");
      
      // Insert the submission into the onboarding_submissions table
      const { data, error } = await supabase
        .from('onboarding_submissions')
        .insert({
          token,
          name,
          email,
          data: formData,
          status: 'pending'
        })
        .select('id')
        .single();
        
      if (error) {
        console.error("Error saving onboarding data:", error);
        throw error;
      }
      
      console.log("Onboarding submission saved:", data);
      
      // Return a placeholder ID for now - actual ID will be generated upon approval
      return data?.id;
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
      team: TeamEnum;
      creatorType: CreatorTypeEnum;
    }
  ): Promise<string | undefined> {
    try {
      // Map personal info from the form data
      const personalInfo = formData.personalInfo || {};
      const email = personalInfo.email;
      
      if (!email) {
        throw new Error("Email is required for creator registration");
      }
      
      // The default password for all creators
      const defaultPassword = "XentrikBananas";
      
      // Create a user in the auth system using the authenticated client
      // This should include the API key by default
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: defaultPassword,
        options: {
          data: {
            name: creatorInfo.name,
            role: 'Employee',
            roles: ['Creator']
          }
        }
      });
      
      if (authError) {
        console.error("Auth error details:", authError);
        throw new Error(`Failed to create auth user: ${authError.message}`);
      }
      
      if (!authData.user?.id) {
        throw new Error("Failed to retrieve user ID from authentication");
      }
      
      const userId = authData.user.id;
      
      // Map the gender value from the onboarding form to our database enum
      let genderValue: GenderEnum = "Female";
      
      if (personalInfo.sex === "Male") {
        genderValue = "Male";
      } else if (personalInfo.sex === "Female") {
        genderValue = "Female";
      } else if (personalInfo.sex === "Transgender") {
        genderValue = "Trans";
      }
      
      // Create creator record with the same ID as the auth user
      const { data: creatorData, error: creatorError } = await supabase
        .from('creators')
        .insert({
          id: userId,
          name: creatorInfo.name,
          email: email,
          gender: genderValue,
          team: creatorInfo.team,
          creator_type: creatorInfo.creatorType,
          sex: personalInfo.sex || null,
          notes: personalInfo.notes || null,
          telegram_username: personalInfo.telegramUsername || null,
          whatsapp_number: personalInfo.whatsappNumber || null,
          needs_review: false, // Mark as reviewed since it's approved
          active: true,
          model_profile: formData
        } as TablesInsert<"creators">)
        .select("id")
        .single();
      
      if (creatorError) {
        // If there was an error creating the creator, try to delete the auth user
        if (userId) {
          try {
            // NOTE: Delete functionality is disabled here since it would require admin privileges
            console.error("Failed to create creator record, but cannot delete auth user due to permissions");
          } catch (deleteError) {
            console.error("Error deleting auth user after creator creation failed:", deleteError);
          }
        }
        throw creatorError;
      }
      
      // Create empty social links record for the creator
      const { error: socialLinksError } = await supabase
        .from('creator_social_links')
        .insert({
          creator_id: userId
        });
      
      if (socialLinksError) {
        console.error('Error creating social links:', socialLinksError);
      }
      
      console.log("Successfully created creator with ID:", userId);
      
      return userId;
    } catch (error) {
      console.error("Error accepting submission:", error);
      return undefined;
    }
  }
}
