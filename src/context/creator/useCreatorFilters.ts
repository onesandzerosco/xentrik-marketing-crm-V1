
import { Creator } from "@/types";

interface CreatorFilters {
  gender?: string[];
  team?: string[];
  creatorType?: string[];
  reviewStatus?: string[];
  searchQuery?: string;
}

export const useCreatorFilters = (creators: Creator[]) => {
  const filterCreators = (filters: CreatorFilters) => {
    const { gender, team, creatorType, reviewStatus, searchQuery } = filters;

    return creators.filter((creator: Creator) => {
      // Gender filter
      const matchesGender = !gender?.length || gender.includes(creator.gender);

      // Team filter
      const matchesTeam = !team?.length || team.includes(creator.team);

      // Creator type filter
      const matchesType = !creatorType?.length || creatorType.includes(creator.creatorType);
      
      // Review status filter
      const matchesReviewStatus = !reviewStatus?.length || 
        (reviewStatus.includes('Needs Review') && creator.needsReview) || 
        (reviewStatus.includes('Reviewed') && !creator.needsReview);

      // Search filter (case insensitive)
      const matchesSearch = !searchQuery || 
        creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (creator.email && creator.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (creator.telegramUsername && creator.telegramUsername.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesGender && matchesTeam && matchesType && matchesReviewStatus && matchesSearch;
    });
  };

  return { filterCreators };
};

export default useCreatorFilters;
