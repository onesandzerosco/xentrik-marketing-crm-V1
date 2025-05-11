
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
          active: true
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
        .single();
      
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
