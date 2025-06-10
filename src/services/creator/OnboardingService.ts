
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
   * Extract and save social media handles from submission data
   * @param formData The onboarding form data
   * @param creatorEmail The creator's email address
   */
  private static async saveSocialMediaHandles(formData: any, creatorEmail: string): Promise<void> {
    try {
      console.log("=== SAVING SOCIAL MEDIA HANDLES ===");
      console.log("Creator email:", creatorEmail);
      console.log("Form data structure:", JSON.stringify(formData, null, 2));
      
      // Check multiple possible locations for social media handles
      let socialMediaHandles = null;
      
      // First check if it's directly in the root (from onboarding queue data)
      if (formData.socialMediaHandles) {
        socialMediaHandles = formData.socialMediaHandles;
        console.log("Found social media handles in root:", socialMediaHandles);
      }
      // Also check for individual platform fields at root level
      else if (formData.instagram || formData.tiktok || formData.twitter || formData.onlyfans || formData.snapchat) {
        socialMediaHandles = {
          instagram: formData.instagram || '',
          tiktok: formData.tiktok || '',
          twitter: formData.twitter || '',
          onlyfans: formData.onlyfans || '',
          snapchat: formData.snapchat || ''
        };
        console.log("Found individual platform fields in root:", socialMediaHandles);
      }
      // Then check in contentAndService (from multi-step form)
      else if (formData.contentAndService?.socialMediaHandles) {
        socialMediaHandles = formData.contentAndService.socialMediaHandles;
        console.log("Found social media handles in contentAndService:", socialMediaHandles);
      }
      
      if (!socialMediaHandles) {
        console.log("No social media handles found in form data");
        return;
      }
      
      const socialMediaRecords: any[] = [];

      // Process predefined platforms - always create entries for these
      const predefinedPlatforms = ['tiktok', 'twitter', 'onlyfans', 'snapchat', 'instagram'];
      
      for (const platform of predefinedPlatforms) {
        const username = socialMediaHandles[platform] || '';
        
        // Always create a record for predefined platforms, even if empty
        socialMediaRecords.push({
          creator_email: creatorEmail,
          platform: platform.charAt(0).toUpperCase() + platform.slice(1), // Capitalize first letter
          username: username,
          password: '', // Empty password initially
          notes: '', // Empty notes initially
          is_predefined: true
        });
      }

      // Process "other" platforms - only if they have data
      if (socialMediaHandles.other && Array.isArray(socialMediaHandles.other)) {
        for (const otherPlatform of socialMediaHandles.other) {
          if (otherPlatform.platform && otherPlatform.handle) {
            socialMediaRecords.push({
              creator_email: creatorEmail,
              platform: otherPlatform.platform,
              username: otherPlatform.handle,
              password: '', // Empty password initially
              notes: '', // Empty notes initially
              is_predefined: false
            });
          }
        }
      }

      // Insert all social media records
      if (socialMediaRecords.length > 0) {
        console.log("Inserting social media records:", socialMediaRecords);
        
        const { error } = await supabase
          .from('social_media_logins')
          .insert(socialMediaRecords);

        if (error) {
          console.error("Error saving social media handles:", error);
          throw error;
        }

        console.log(`Successfully saved ${socialMediaRecords.length} social media handles for ${creatorEmail}`);
      } else {
        console.log("No social media handles to save");
      }
    } catch (error) {
      console.error("Error in saveSocialMediaHandles:", error);
      // Don't throw the error to avoid breaking the main flow
      // Just log it since social media handles are not critical for account creation
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
      profileImage?: string;
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
      
      // Create the user via the create_team_member edge function to ensure proper role assignment
      const { data: teamMemberResponse, error: teamMemberError } = await supabase.functions.invoke('create_team_member', {
        body: {
          email,
          password: defaultPassword,
          name: creatorInfo.name,
          primary_role: 'Employee',  // Set primary role as Employee
          additional_roles: ['Creator']  // Set additional role as Creator
        }
      });
      
      if (teamMemberError || !teamMemberResponse?.success) {
        console.error("Team member creation error:", teamMemberError || teamMemberResponse);
        throw new Error(`Failed to create user account: ${teamMemberError?.message || 'Unknown error'}`);
      }
      
      const userId = teamMemberResponse.user.id;
      
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
          profile_image: creatorInfo.profileImage || null,
          needs_review: false, // Mark as reviewed since it's approved
          active: true,
          model_profile: formData
        } as TablesInsert<"creators">)
        .select("id")
        .single();
      
      if (creatorError) {
        console.error("Creator record creation error:", creatorError);
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

      // Save social media handles to the social_media_logins table
      await this.saveSocialMediaHandles(formData, email);
      
      console.log("Successfully created creator with ID:", userId);
      
      return userId;
    } catch (error) {
      console.error("Error accepting submission:", error);
      return undefined;
    }
  }
}
