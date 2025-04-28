
import React, { useState, useEffect, useRef } from "react";
import { Activity, ChangeDetail } from "@/types/activity";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InfoIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import "@/styles/animations.module.css"; // Import for animations

interface RecentActivitiesProps {
  activities: Activity[];
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ activities: initialActivities }) => {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const supabaseChannelRef = useRef<any>(null);

  // Set up a real-time subscription to activities
  useEffect(() => {
    // Initial load from props
    setActivities(initialActivities);

    // Set up live updates with Supabase realtime
    const channel = supabase
      .channel('activities-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'activities'
      }, (payload) => {
        console.log('Received activity update:', payload);
        
        // When we receive updates, refresh activities using context data
        // This avoids race conditions with polling
        setActivities(prev => {
          // If it's a new activity, add it to the top
          if (payload.eventType === 'INSERT') {
            const newActivity = payload.new as Activity;
            // Ensure we don't add duplicates by checking IDs
            const exists = prev.some(activity => activity.id === newActivity.id);
            if (!exists) {
              return [newActivity, ...prev];
            }
          }
          return [...prev];
        });
      })
      .subscribe((status) => {
        console.log('Supabase channel status:', status);
      });
    
    // Store the channel reference for cleanup
    supabaseChannelRef.current = channel;
    
    // Clean up function
    return () => {
      if (supabaseChannelRef.current) {
        console.log('Removing Supabase channel');
        supabase.removeChannel(supabaseChannelRef.current);
      }
    };
  }, [initialActivities]);

  // Map activity type to color
  const getActivityColor = (type: string) => {
    switch (type) {
      case "create":
        return "bg-green-500";
      case "update":
        return "bg-yellow-500";
      case "alert":
        return "bg-red-500";
      case "bulk-update":
        return "bg-blue-500";
      default:
        return "bg-blue-500";
    }
  };

  // Format time with precise intervals for recent times
  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diffInMinutes = Math.floor((now - timestamp) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'just now';
    } else if (diffInMinutes === 1) {
      return '1m ago';
    } else if (diffInMinutes < 5) {
      return `${diffInMinutes}m ago`;
    } else {
      // After 5 minutes, use the date-fns formatter which will update every 5 minutes
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    }
  };

  return (
    <>
      <div className="bg-card rounded-xl p-6 shadow-sm">
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">
            Loading activities...
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No recent activities found
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center p-3 border border-border rounded-lg animate-fade-in">
                <div className={`h-2 w-2 rounded-full ${getActivityColor(activity.type)} mr-3`}></div>
                <p className="text-sm flex-grow">{activity.message}</p>
                
                {activity.changeDetails && activity.changeDetails.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mr-2" 
                    onClick={() => setSelectedActivity(activity)}
                  >
                    <InfoIcon className="h-4 w-4" />
                  </Button>
                )}
                
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatTimestamp(activity.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Dialog */}
      <Dialog open={!!selectedActivity} onOpenChange={(open) => !open && setSelectedActivity(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {selectedActivity?.changeDetails?.map((detail, index) => (
              <div key={index} className="border-b pb-2">
                <div className="font-medium capitalize">{detail.field}</div>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <span className="text-xs text-muted-foreground">From:</span>
                    <div className="text-sm">{detail.oldValue || 'None'}</div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">To:</span>
                    <div className="text-sm">{detail.newValue || 'None'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RecentActivities;
