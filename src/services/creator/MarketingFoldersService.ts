import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

/**
 * Service for creating default marketing categories and folders for creators
 */
export class MarketingFoldersService {
  /**
   * Create default marketing categories and folders for a creator
   * @param creatorId The creator ID
   * @returns Promise<boolean> - true if successful, false otherwise
   */
  static async createDefaultMarketingStructure(creatorId: string): Promise<boolean> {
    try {
      console.log("Creating default marketing structure for creator:", creatorId);
      
      // Define the default categories and their folders
      const defaultStructure = [
        {
          categoryName: "Personality",
          folders: ["Food", "Hobby", "Pet", "Niche"]
        },
        {
          categoryName: "AI Generated", 
          folders: ["Photos", "Videos"]
        },
        {
          categoryName: "NSFW",
          folders: ["Photos", "Videos"]
        },
        {
          categoryName: "SFW",
          folders: ["Photos", "Videos"]
        },
        {
          categoryName: "Reddit Verification",
          folders: ["Current Month", "Previous Months"]
        },
        {
          categoryName: "Reels",
          folders: ["Uploaded", "Scheduled", "To Schedule"]
        },
        {
          categoryName: "Scripts",
          folders: [] // Empty for now as specified
        }
      ];

      // Create categories and folders
      for (const category of defaultStructure) {
        const categoryId = uuidv4();
        
        // Create the category
        const { error: categoryError } = await supabase
          .from('file_categories')
          .insert({
            category_id: categoryId,
            category_name: category.categoryName,
            creator: creatorId
          });

        if (categoryError) {
          console.error(`Error creating category ${category.categoryName}:`, categoryError);
          throw categoryError;
        }

        console.log(`Created category: ${category.categoryName}`);

        // Create folders for this category
        if (category.folders.length > 0) {
          const folderInserts = category.folders.map(folderName => ({
            folder_id: uuidv4(),
            folder_name: folderName,
            category_id: categoryId,
            creator_id: creatorId
          }));

          const { error: foldersError } = await supabase
            .from('file_folders')
            .insert(folderInserts);

          if (foldersError) {
            console.error(`Error creating folders for category ${category.categoryName}:`, foldersError);
            throw foldersError;
          }

          console.log(`Created ${category.folders.length} folders for category: ${category.categoryName}`);
        }
      }

      console.log("Successfully created default marketing structure for creator:", creatorId);
      return true;

    } catch (error) {
      console.error("Error creating default marketing structure:", error);
      return false;
    }
  }
}