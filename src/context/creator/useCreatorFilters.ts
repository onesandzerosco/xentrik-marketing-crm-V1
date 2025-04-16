
import { useCallback } from "react";
import { Creator } from "@/types";

export const useCreatorFilters = (creators: Creator[]) => {
  const filterCreators = useCallback((filters: { 
    gender?: string[]; 
    team?: string[]; 
    creatorType?: string[]; 
    reviewStatus?: string[] 
  }) => {
    return creators.filter((creator) => {
      let genderMatch = true;
      let teamMatch = true;
      let creatorTypeMatch = true;
      let reviewStatusMatch = true;

      if (filters.gender && filters.gender.length > 0) {
        genderMatch = filters.gender.includes(creator.gender);
      }

      if (filters.team && filters.team.length > 0) {
        teamMatch = filters.team.includes(creator.team);
      }

      if (filters.creatorType && filters.creatorType.length > 0) {
        creatorTypeMatch = filters.creatorType.includes(creator.creatorType);
      }

      if (filters.reviewStatus && filters.reviewStatus.length > 0) {
        const isInReview = creator.needsReview === true;
        reviewStatusMatch = filters.reviewStatus.includes('review') ? isInReview : !isInReview;
      }

      return genderMatch && teamMatch && creatorTypeMatch && reviewStatusMatch;
    });
  }, [creators]);

  return { filterCreators };
};
