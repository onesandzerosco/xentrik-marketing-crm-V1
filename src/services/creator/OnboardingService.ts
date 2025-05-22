
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
   * Validate email address format
   * @param email The email address to validate
   * @returns True if email is valid, false otherwise
   */
  private static validateEmail(email: string): boolean {
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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

      // Validate email format
      if (!this.validateEmail(email)) {
        throw new Error(`Invalid email format: ${email}`);
      }
      
      // Check if user already exists with this email
      // Instead of using admin.getUserByEmail which isn't available,
      // we'll check the profiles table
      const { data: existingUserProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (profileError) {
        console.error("Error checking existing user:", profileError);
      }
      
      if (existingUserProfile) {
        throw new Error(`A user with email ${email} already exists`);
      }
      
      // The default password for all creators
      const defaultPassword = "XentrikBananas";
      
      console.log(`Attempting to create auth user with email: ${email}`);
      
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
          },
          emailRedirectTo: window.location.origin // Add redirect URL
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
        console.error("Error creating creator record:", creatorError);
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
      throw error; // Re-throw to handle in the calling function
    }
  }
}
