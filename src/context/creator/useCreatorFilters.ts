
import { Creator } from "@/types";

export const useCreatorFilters = (creators: Creator[]) => {
  const filterCreators = (filters: {
    gender?: string[];
    team?: string[];
    creatorType?: string[];
    reviewStatus?: string[];
    searchQuery?: string;
  }) => {
    return creators.filter((creator) => {
      // Filter by active status (always show only active creators)
      if (creator.active === false) {
        return false;
      }

      // Filter by gender
      if (
        filters.gender &&
        filters.gender.length > 0 &&
        !filters.gender.includes(creator.gender)
      ) {
        return false;
      }

      // Filter by team
      if (
        filters.team &&
        filters.team.length > 0 &&
        !filters.team.includes(creator.team)
      ) {
        return false;
      }

      // Filter by creator type
      if (
        filters.creatorType &&
        filters.creatorType.length > 0 &&
        !filters.creatorType.includes(creator.creatorType)
      ) {
        return false;
      }

      // Filter by review status
      if (filters.reviewStatus && filters.reviewStatus.length > 0) {
        const needsReview = creator.needsReview === true;
        if (
          (filters.reviewStatus.includes("Needs Review") && !needsReview) ||
          (filters.reviewStatus.includes("Reviewed") && needsReview)
        ) {
          return false;
        }
      }

      // Filter by search query
      if (filters.searchQuery && filters.searchQuery.trim() !== "") {
        const query = filters.searchQuery.toLowerCase();
        const matchName = creator.name.toLowerCase().includes(query);
        const matchTelegram = creator.telegramUsername 
          ? creator.telegramUsername.toLowerCase().includes(query)
          : false;
        
        // Match by tags if available
        const matchTags = creator.tags 
          ? creator.tags.some(tag => tag.toLowerCase().includes(query))
          : false;
          
        if (!matchName && !matchTelegram && !matchTags) {
          return false;
        }
      }

      // Show this creator if it passed all filters
      return true;
    });
  };

  return { filterCreators };
};
