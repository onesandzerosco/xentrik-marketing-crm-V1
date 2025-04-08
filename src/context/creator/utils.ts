
import { Creator, EngagementStats } from "../../types";
import { ChangeDetail } from "../../types/activity";

// Local storage keys
export const CREATORS_STORAGE_KEY = "creators_data";
export const CREATORS_STATS_STORAGE_KEY = CREATORS_STORAGE_KEY + "_stats";

// Initial load from localStorage or empty array for creators
export const getInitialCreators = (initialCreators: Creator[]): Creator[] => {
  const savedCreators = localStorage.getItem(CREATORS_STORAGE_KEY);
  return savedCreators ? JSON.parse(savedCreators) : initialCreators;
};

// Initial load from localStorage or empty array for stats
export const getInitialStats = (initialStats: Record<string, EngagementStats>): Record<string, EngagementStats> => {
  const savedStats = localStorage.getItem(CREATORS_STORAGE_KEY + "_stats");
  return savedStats ? JSON.parse(savedStats) : initialStats;
};

// Create empty stats for a new creator
export const createEmptyStats = (): EngagementStats => ({
  instagram: { followers: 0, engagement: 0, trend: 0 },
  tiktok: { views: 0, followers: 0, trend: 0 },
  twitter: { impressions: 0, followers: 0, trend: 0 },
  reddit: { upvotes: 0, subscribers: 0, trend: 0 },
  chaturbate: { viewers: 0, followers: 0, trend: 0 },
});

// Get change details when updating a creator
export const getCreatorChangeDetails = (
  existingCreator: Creator,
  updates: Partial<Creator>
): ChangeDetail[] => {
  const changeDetails: ChangeDetail[] = [];

  if (updates.name && updates.name !== existingCreator.name) {
    changeDetails.push({
      field: "name",
      oldValue: existingCreator.name,
      newValue: updates.name
    });
  }

  if (updates.team && updates.team !== existingCreator.team) {
    changeDetails.push({
      field: "team",
      oldValue: existingCreator.team,
      newValue: updates.team
    });
  }

  if (updates.gender && updates.gender !== existingCreator.gender) {
    changeDetails.push({
      field: "gender",
      oldValue: existingCreator.gender,
      newValue: updates.gender
    });
  }

  if (updates.creatorType && updates.creatorType !== existingCreator.creatorType) {
    changeDetails.push({
      field: "creatorType",
      oldValue: existingCreator.creatorType,
      newValue: updates.creatorType
    });
  }

  if (updates.needsReview !== undefined && updates.needsReview !== existingCreator.needsReview) {
    changeDetails.push({
      field: "reviewStatus",
      oldValue: existingCreator.needsReview ? "Needs Review" : "Approved",
      newValue: updates.needsReview ? "Needs Review" : "Approved"
    });
  }

  return changeDetails;
};
