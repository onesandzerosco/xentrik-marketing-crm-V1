
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Creator } from "@/types";

export const useDeleteCreator = (
  creators: Creator[],
  setCreators: React.Dispatch<React.SetStateAction<Creator[]>>,
  addActivity: (action: string, description: string, creatorId: string) => void
) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const deleteCreator = async (creatorId: string) => {
    if (!creatorId) {
      toast({
        title: "Error",
        description: "Creator ID is required",
        variant: "destructive",
      });
      return false;
    }

    setIsDeleting(true);

    try {
      console.log(`Deleting creator with ID: ${creatorId}`);

      // Delete creator tags first (due to foreign key constraints)
      const { error: tagsError } = await supabase
        .from('creator_tags')
        .delete()
        .eq('creator_id', creatorId);

      if (tagsError) {
        throw new Error(`Error deleting creator tags: ${tagsError.message}`);
      }

      // Delete creator social links
      const { error: socialLinksError } = await supabase
        .from('creator_social_links')
        .delete()
        .eq('creator_id', creatorId);

      if (socialLinksError) {
        throw new Error(`Error deleting creator social links: ${socialLinksError.message}`);
      }

      // Delete creator team members relationships
      const { error: teamMembersError } = await supabase
        .from('creator_team_members')
        .delete()
        .eq('creator_id', creatorId);

      if (teamMembersError) {
        throw new Error(`Error deleting creator team members: ${teamMembersError.message}`);
      }

      // Delete creator telegram groups
      const { error: telegramGroupsError } = await supabase
        .from('creator_telegram_groups')
        .delete()
        .eq('creator_id', creatorId);

      if (telegramGroupsError) {
        throw new Error(`Error deleting creator telegram groups: ${telegramGroupsError.message}`);
      }

      // Finally, delete the creator itself
      const { error: creatorError } = await supabase
        .from('creators')
        .delete()
        .eq('id', creatorId);

      if (creatorError) {
        throw new Error(`Error deleting creator: ${creatorError.message}`);
      }

      // Update local state
      setCreators(creators.filter(creator => creator.id !== creatorId));
      
      // Add activity log
      addActivity("delete", `Creator deleted`, creatorId);

      toast({
        title: "Success",
        description: "Creator successfully removed",
      });

      return true;
    } catch (error) {
      console.error("Error deleting creator:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred while deleting the creator",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteCreator, isDeleting };
};
