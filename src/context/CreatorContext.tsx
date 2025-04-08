import React, { createContext, useContext, useState, useEffect } from "react";
import { Creator, EngagementStats, CreatorType } from "../types/";
import { useActivities } from "./ActivityContext";
import { ChangeDetail } from "../types/activity";

// Local storage key
const CREATORS_STORAGE_KEY = "creators_data";

// Mock data for initial creators
const initialCreators: Creator[] = [
  {
    id: "1",
    name: "Oliver",
    profileImage: "/avatar1.png",
    gender: "Male",
    team: "A Team",
    creatorType: "Real",
    socialLinks: {
      instagram: "https://instagram.com",
      twitter: "https://twitter.com",
      reddit: "https://reddit.com",
    },
    tags: ["Male", "A Team"],
    needsReview: true,
  },
  {
    id: "2",
    name: "Janas",
    profileImage: "/avatar2.png",
    gender: "Female",
    team: "B Team",
    creatorType: "Real",
    socialLinks: {
      instagram: "https://instagram.com",
      tiktok: "https://tiktok.com",
      twitter: "https://twitter.com",
    },
    tags: ["Female", "B Team"],
    needsReview: false,
  },
  {
    id: "3",
    name: "Frans",
    profileImage: "/avatar3.png",
    gender: "Trans",
    team: "C Team",
    creatorType: "Real",
    socialLinks: {
      instagram: "https://instagram.com",
      twitter: "https://twitter.com",
    },
    tags: ["Trans", "C Team"],
  },
  {
    id: "4",
    name: "Jorelan",
    profileImage: "/avatar4.png",
    gender: "Female",
    team: "B Team",
    creatorType: "AI",
    socialLinks: {
      instagram: "https://instagram.com",
      tiktok: "https://tiktok.com",
      twitter: "https://twitter.com",
    },
    tags: ["AI", "B Team"],
  },
  {
    id: "5",
    name: "Fremay",
    profileImage: "/avatar5.png",
    gender: "Male",
    team: "A Team",
    creatorType: "AI",
    socialLinks: {
      instagram: "https://instagram.com",
      twitter: "https://twitter.com",
    },
    tags: ["AI", "A Team"],
  },
  {
    id: "6",
    name: "Tremt",
    profileImage: "/avatar6.png",
    gender: "Male",
    team: "A Team",
    creatorType: "AI",
    socialLinks: {
      instagram: "https://instagram.com",
      tiktok: "https://tiktok.com",
      twitter: "https://twitter.com",
    },
    tags: ["AI", "A Team"],
  },
];

// Mock engagement stats
const mockEngagementStats: Record<string, EngagementStats> = {
  "1": {
    instagram: { followers: 15000, engagement: 8.5, trend: 2.3 },
    tiktok: { views: 250000, followers: 10000, trend: 5.7 },
    twitter: { impressions: 50000, followers: 5000, trend: -1.2 },
    reddit: { upvotes: 3000, subscribers: 2000, trend: 10.5 },
    chaturbate: { viewers: 5000, followers: 2000, trend: 3.8 },
  },
  "2": {
    instagram: { followers: 25000, engagement: 10.2, trend: 1.5 },
    tiktok: { views: 500000, followers: 30000, trend: 8.3 },
    twitter: { impressions: 30000, followers: 8000, trend: 4.1 },
    reddit: { upvotes: 5000, subscribers: 3500, trend: 2.0 },
    chaturbate: { viewers: 8000, followers: 4000, trend: 6.7 },
  },
  "3": {
    instagram: { followers: 8000, engagement: 7.8, trend: -2.5 },
    tiktok: { views: 120000, followers: 15000, trend: 3.2 },
    twitter: { impressions: 25000, followers: 3000, trend: 1.8 },
    reddit: { upvotes: 1500, subscribers: 800, trend: -5.3 },
    chaturbate: { viewers: 3000, followers: 1500, trend: -1.2 },
  },
  "4": {
    instagram: { followers: 18000, engagement: 9.2, trend: 3.6 },
    tiktok: { views: 300000, followers: 25000, trend: 4.5 },
    twitter: { impressions: 40000, followers: 7000, trend: 2.8 },
    reddit: { upvotes: 4000, subscribers: 2500, trend: 6.3 },
    chaturbate: { viewers: 6000, followers: 3000, trend: 4.2 },
  },
  "5": {
    instagram: { followers: 30000, engagement: 12.5, trend: 8.7 },
    tiktok: { views: 600000, followers: 40000, trend: 10.2 },
    twitter: { impressions: 60000, followers: 12000, trend: 7.9 },
    reddit: { upvotes: 8000, subscribers: 5000, trend: 9.1 },
    chaturbate: { viewers: 10000, followers: 6000, trend: 8.4 },
  },
  "6": {
    instagram: { followers: 12000, engagement: 8.0, trend: 1.0 },
    tiktok: { views: 200000, followers: 18000, trend: 2.5 },
    twitter: { impressions: 35000, followers: 6000, trend: 3.0 },
    reddit: { upvotes: 2500, subscribers: 1500, trend: 1.8 },
    chaturbate: { viewers: 4000, followers: 2500, trend: 2.2 },
  },
};

interface CreatorContextType {
  creators: Creator[];
  addCreator: (creator: Omit<Creator, "id">) => void;
  updateCreator: (id: string, updates: Partial<Creator>) => void;
  getCreator: (id: string) => Creator | undefined;
  getCreatorStats: (id: string) => EngagementStats | undefined;
  filterCreators: (filters: { gender?: string[]; team?: string[]; creatorType?: string[] }) => Creator[];
}

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
  const [creators, setCreators] = useState<Creator[]>(() => {
    const savedCreators = localStorage.getItem(CREATORS_STORAGE_KEY);
    return savedCreators ? JSON.parse(savedCreators) : initialCreators;
  });
  
  // Save stats to localStorage with creators or use mock data
  const [stats, setStats] = useState<Record<string, EngagementStats>>(() => {
    const savedStats = localStorage.getItem(CREATORS_STORAGE_KEY + "_stats");
    return savedStats ? JSON.parse(savedStats) : mockEngagementStats;
  });
  
  const { addActivity } = useActivities();

  // Save creators to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(CREATORS_STORAGE_KEY, JSON.stringify(creators));
  }, [creators]);
  
  // Save stats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(CREATORS_STORAGE_KEY + "_stats", JSON.stringify(stats));
  }, [stats]);

  const addCreator = (creator: Omit<Creator, "id">) => {
    const newCreator = {
      ...creator,
      id: Date.now().toString(),
      needsReview: true,
    };
    
    // Update stats for the new creator
    const newStats = { ...stats };
    newStats[newCreator.id] = {
      instagram: { followers: 0, engagement: 0, trend: 0 },
      tiktok: { views: 0, followers: 0, trend: 0 },
      twitter: { impressions: 0, followers: 0, trend: 0 },
      reddit: { upvotes: 0, subscribers: 0, trend: 0 },
      chaturbate: { viewers: 0, followers: 0, trend: 0 },
    };
    
    setCreators([...creators, newCreator]);
    setStats(newStats);
    
    addActivity("create", `New creator onboarded: ${creator.name}`, newCreator.id);
  };

  const updateCreator = (id: string, updates: Partial<Creator>) => {
    const existingCreator = creators.find(c => c.id === id);
    
    setCreators(
      creators.map((creator) =>
        creator.id === id ? { ...creator, ...updates } : creator
      )
    );
    
    if (existingCreator) {
      const changeDetails: ChangeDetail[] = [];
      let hasMultipleChanges = false;
      
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
