
import React, { createContext, useContext, useState, useEffect } from "react";
import { Creator, EngagementStats } from "../types/";
import { useActivities } from "./ActivityContext";
import { ChangeDetail } from "../types/activity";
import { CreatorContextType } from "./creator/types";
import { 
  CREATORS_STORAGE_KEY, 
  CREATORS_STATS_STORAGE_KEY,
  getInitialCreators, 
  getInitialStats, 
  createEmptyStats, 
  getCreatorChangeDetails 
} from "./creator/utils";
import { initialCreators, mockEngagementStats } from "./creator/mockData";

const CreatorContext = createContext<CreatorContextType>({
  creators: [],
  addCreator: () => {},
  updateCreator: () => {},
  getCreator: () => undefined,
  getCreatorStats: () => undefined,
  filterCreators: () => [],
});

export const useCreators = () => useContext(CreatorContext);

export const CreatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with data from localStorage or use mock data if no saved data
  const [creators, setCreators] = useState<Creator[]>(() => 
    getInitialCreators(initialCreators)
  );
  
  // Save stats to localStorage with creators or use mock data
  const [stats, setStats] = useState<Record<string, EngagementStats>>(() => 
    getInitialStats(mockEngagementStats)
  );
  
  const { addActivity } = useActivities();

  // Save creators to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(CREATORS_STORAGE_KEY, JSON.stringify(creators));
  }, [creators]);
  
  // Save stats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(CREATORS_STATS_STORAGE_KEY, JSON.stringify(stats));
  }, [stats]);

  const addCreator = (creator: Omit<Creator, "id">) => {
    const newCreator = {
      ...creator,
      id: Date.now().toString(),
      needsReview: true,
    };
    
    // Update stats for the new creator
    const newStats = { ...stats };
    newStats[newCreator.id] = createEmptyStats();
    
    setCreators([...creators, newCreator]);
    setStats(newStats);
    
    addActivity("create", `New creator onboarded: ${creator.name}`, newCreator.id);
  };

  const updateCreator = (id: string, updates: Partial<Creator>) => {
    const existingCreator = creators.find(c => c.id === id);
    
    // Update the creators array with the new data
    setCreators(
      creators.map((creator) =>
        creator.id === id ? { ...creator, ...updates } : creator
      )
    );
    
    // Check if the profile image was updated
    if (existingCreator && updates.profileImage && updates.profileImage !== existingCreator.profileImage) {
      // Add a specific log for profile image updates
      addActivity(
        "update", 
        `Profile picture updated for: ${existingCreator.name}`, 
        id, 
        [{
          field: "profileImage",
          oldValue: "previous image",
          newValue: "new image" 
        }]
      );
    }
    
    // Process other changes as before
    if (existingCreator) {
      const changeDetails = getCreatorChangeDetails(existingCreator, updates);
      let hasMultipleChanges = false;
      
      hasMultipleChanges = changeDetails.length > 1;
      
      if (hasMultipleChanges) {
        const fieldsList = changeDetails.map(detail => detail.field).join(", ");
        addActivity("bulk-update", `Multiple updates for ${existingCreator.name} (${changeDetails.length} changes)`, id, changeDetails);
      } 
      else if (changeDetails.length === 1) {
        const change = changeDetails[0];
        
        if (change.field === "name") {
          addActivity("update", `Profile name updated for: ${existingCreator.name} → ${updates.name}`, id, changeDetails);
        } 
        else if (change.field === "team") {
          addActivity("update", `Team updated for: ${existingCreator.name} (${existingCreator.team} → ${updates.team})`, id, changeDetails);
        } 
        else if (change.field === "gender") {
          addActivity("update", `Gender updated for: ${existingCreator.name}`, id, changeDetails);
        } 
        else if (change.field === "reviewStatus") {
          if (updates.needsReview) {
            addActivity("alert", `Review flag added for: ${existingCreator.name}`, id, changeDetails);
          } else {
            addActivity("update", `Review completed for: ${existingCreator.name}`, id, changeDetails);
          }
        } 
        else {
          addActivity("update", `Profile updated for: ${existingCreator.name}`, id);
        }
      }
      else if (Object.keys(updates).length > 0) {
        addActivity("update", `Profile updated for: ${existingCreator.name}`, id);
      }
    }
  };

  const getCreator = (id: string) => {
    return creators.find((creator) => creator.id === id);
  };

  const getCreatorStats = (id: string) => {
    return stats[id];
  };

  const filterCreators = (filters: { gender?: string[]; team?: string[]; creatorType?: string[] }) => {
    return creators.filter((creator) => {
      let genderMatch = true;
      let teamMatch = true;
      let creatorTypeMatch = true;

      if (filters.gender && filters.gender.length > 0) {
        genderMatch = filters.gender.includes(creator.gender);
      }

      if (filters.team && filters.team.length > 0) {
        teamMatch = filters.team.includes(creator.team);
      }

      if (filters.creatorType && filters.creatorType.length > 0) {
        creatorTypeMatch = filters.creatorType.includes(creator.creatorType);
      }

      return genderMatch && teamMatch && creatorTypeMatch;
    });
  };

  return (
    <CreatorContext.Provider
      value={{
        creators,
        addCreator,
        updateCreator,
        getCreator,
        getCreatorStats,
        filterCreators,
      }}
    >
      {children}
    </CreatorContext.Provider>
  );
};
