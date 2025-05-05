
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export class CreatorService {
  static async ensureCreatorRecordExists(userId: string) {
    try {
      // Get user data from profiles table
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', userId)
        .single();
      
      if (userError) {
        console.error("Error fetching user data:", userError);
        return;
      }

      if (!userData || !userData.name) {
        console.error("User data is missing or incomplete");
        return;
      }

      // Check if creator record already exists
      const { data: existingCreator } = await supabase
        .from('creators')
        .select('id, active')
        .eq('id', userId)
        .maybeSingle();

      // If creator record doesn't exist, create one
      if (!existingCreator) {
        console.log("Creating new creator record for user:", userId);
        
        // Create the creator record with required fields
        const { error: creatorError } = await supabase
          .from('creators')
          .insert({
            id: userId,
            name: userData.name,
            gender: 'Male', // Default value
            team: 'A Team', // Default value
            creator_type: 'Real', // Default value
            needs_review: false, // Automatically approved
            active: true // Explicitly set to active
          });

        if (creatorError) {
          console.error("Error creating creator record:", creatorError);
          return;
        }

        // Create an empty social links record for the creator
        const { error: socialLinksError } = await supabase
          .from('creator_social_links')
          .insert({
            creator_id: userId
          });

        if (socialLinksError) {
          console.error("Error creating social links record:", socialLinksError);
        }
        
        return { message: `${userData.name} has been set up as a creator` };
      } else if (!existingCreator.active) {
        // If creator record exists but is inactive, make it active again
        const { error: updateError } = await supabase
          .from('creators')
          .update({ 
            active: true,
            needs_review: false // Also ensure it's approved
          })
          .eq('id', userId);
          
        if (updateError) {
          console.error("Error updating creator active status:", updateError);
        } else {
          console.log("Reactivated existing creator account:", userId);
          return { message: `${userData.name} has been reactivated as a creator` };
        }
      } else {
        // If creator record exists and is already active, just ensure it's approved
        const { error: updateError } = await supabase
          .from('creators')
          .update({ needs_review: false })
          .eq('id', userId);
          
        if (updateError) {
          console.error("Error updating creator approval status:", updateError);
        }
      }
    } catch (error) {
      console.error("Error ensuring creator record exists:", error);
    }
  }

  static async disableCreatorRecord(userId: string) {
    try {
      // Update the creator record to mark it as inactive
      const { error } = await supabase
        .from('creators')
        .update({
          active: false
        })
        .eq('id', userId);

      if (error) {
        console.error("Error disabling creator record:", error);
        return { error: "Failed to update creator status" };
      } else {
        return { message: "User is no longer listed as a creator" };
      }
    } catch (error) {
      console.error("Error disabling creator record:", error);
      return { error: "An unexpected error occurred" };
    }
  }
}

export default CreatorService;
