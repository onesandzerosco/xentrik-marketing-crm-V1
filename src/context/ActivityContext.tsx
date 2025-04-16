
import React, { createContext, useContext, useState, useEffect } from "react";
import { Activity, ActivityType, ChangeDetail } from "../types/activity";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load activities from Supabase on mount
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        
        // For now, we'll use localStorage as a fallback since we haven't created the activities table yet
        // In a real implementation, this would be fetched from Supabase
        const savedActivities = localStorage.getItem("creator_activities");
        const activitiesData = savedActivities ? JSON.parse(savedActivities) : [];
        
        setActivities(activitiesData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching activities:', error);
        setIsLoading(false);
        toast({
          title: "Error loading activities",
          description: "There was a problem loading activity data",
          variant: "destructive"
        });
      }
    };

    fetchActivities();
    
    // Set up real-time subscription for activities
    const channel = supabase
      .channel('activities-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'activities'
      }, (payload) => {
        // When a new activity is added, add it to our state
        // In a real implementation, we would convert from Supabase format to our Activity type
        fetchActivities();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const addActivity = async (type: ActivityType, message: string, creatorId?: string, changeDetails?: ChangeDetail[]) => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: Date.now(),
      creatorId,
      changeDetails,
    };
    
    try {
      // Store in local state immediately for UI responsiveness
      setActivities(prevActivities => [newActivity, ...prevActivities]);
      
      // Store to localStorage as fallback
      const updatedActivities = [newActivity, ...activities];
      localStorage.setItem("creator_activities", JSON.stringify(updatedActivities));
      
      // In a real implementation, we would also store to Supabase here
      // Once the activities table is created, we would implement this
    } catch (error) {
      console.error('Error adding activity:', error);
      toast({
        title: "Error",
        description: "Failed to record activity",
        variant: "destructive"
      });
    }
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
