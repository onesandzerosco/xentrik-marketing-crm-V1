
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import type { TablesInsert } from "@/integrations/supabase/types";
import type { Database } from "@/integrations/supabase/types";
import { CreatorData } from "./types";

/**
 * Service for adding new creators
 */
export class CreatorAddService {
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
}
