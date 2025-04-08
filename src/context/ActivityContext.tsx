
import React, { createContext, useContext, useState, useEffect } from "react";
import { Activity, ActivityType, ChangeDetail } from "../types/activity";

// Local storage key
const ACTIVITIES_STORAGE_KEY = "creator_activities";

// Initial load from localStorage or empty array
const getInitialActivities = (): Activity[] => {
  const savedActivities = localStorage.getItem(ACTIVITIES_STORAGE_KEY);
  return savedActivities ? JSON.parse(savedActivities) : [];
};

interface ActivityContextType {
  activities: Activity[];
  addActivity: (type: ActivityType, message: string, creatorId?: string, changeDetails?: ChangeDetail[]) => void;
  getRecentActivities: (limit?: number) => Activity[];
}

const ActivityContext = createContext<ActivityContextType>({
  activities: [],
  addActivity: () => {},
  getRecentActivities: () => [],
});

export const useActivities = () => useContext(ActivityContext);

export const ActivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activities, setActivities] = useState<Activity[]>(getInitialActivities());

  // Save to localStorage whenever activities change
  useEffect(() => {
    localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activities));
  }, [activities]);

  const addActivity = (type: ActivityType, message: string, creatorId?: string, changeDetails?: ChangeDetail[]) => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: Date.now(),
      creatorId,
      changeDetails,
    };
    
    setActivities(prevActivities => [newActivity, ...prevActivities]);
  };

  const getRecentActivities = (limit = 5) => {
    return activities.slice(0, limit);
  };

  return (
    <ActivityContext.Provider
      value={{
        activities,
        addActivity,
        getRecentActivities,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
};
