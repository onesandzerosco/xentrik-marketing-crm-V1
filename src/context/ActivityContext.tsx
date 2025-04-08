
import React, { createContext, useContext, useState } from "react";
import { Activity, ActivityType } from "../types/activity";

// Initial mock activities
const initialActivities: Activity[] = [];

interface ActivityContextType {
  activities: Activity[];
  addActivity: (type: ActivityType, message: string, creatorId?: string) => void;
  getRecentActivities: (limit?: number) => Activity[];
}

const ActivityContext = createContext<ActivityContextType>({
  activities: [],
  addActivity: () => {},
  getRecentActivities: () => [],
});

export const useActivities = () => useContext(ActivityContext);

export const ActivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);

  const addActivity = (type: ActivityType, message: string, creatorId?: string) => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: Date.now(),
      creatorId,
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
