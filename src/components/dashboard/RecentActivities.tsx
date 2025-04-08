
import React from "react";
import { Activity } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface RecentActivitiesProps {
  activities: Activity[];
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ activities }) => {
  // Map activity type to color
  const getActivityColor = (type: string) => {
    switch (type) {
      case "create":
        return "bg-green-500";
      case "update":
        return "bg-yellow-500";
      case "alert":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
      {activities.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          No recent activities found
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center p-3 border border-border rounded-lg">
              <div className={`h-2 w-2 rounded-full ${getActivityColor(activity.type)} mr-3`}></div>
              <p className="text-sm">{activity.message}</p>
              <span className="ml-auto text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivities;
