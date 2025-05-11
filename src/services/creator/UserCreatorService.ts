
import { supabase } from "@/integrations/supabase/client";

/**
 * Service for managing user-creator relationship
 */
export class UserCreatorService {
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
