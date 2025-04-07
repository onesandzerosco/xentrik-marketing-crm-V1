
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart2 } from "lucide-react";
import { EngagementStats as EngagementStatsType } from "@/types";

interface EngagementStatsProps {
  creatorId: string;
  stats?: EngagementStatsType;
}

const EngagementStats: React.FC<EngagementStatsProps> = ({ creatorId, stats }) => {
  return (
    <div className="bg-card rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4">Engagement Stats This Week</h2>
      
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border border-border rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Instagram</h3>
              <div className={`flex items-center ${stats.instagram.trend > 0 ? "text-green-500" : "text-red-500"}`}>
                {stats.instagram.trend > 0 ? "↑" : "↓"} {Math.abs(stats.instagram.trend)}%
              </div>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Followers</span>
              <span>{stats.instagram.followers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Engagement</span>
              <span>{stats.instagram.engagement}%</span>
            </div>
          </div>
          
          <div className="p-4 border border-border rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">TikTok</h3>
              <div className={`flex items-center ${stats.tiktok.trend > 0 ? "text-green-500" : "text-red-500"}`}>
                {stats.tiktok.trend > 0 ? "↑" : "↓"} {Math.abs(stats.tiktok.trend)}%
              </div>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Views</span>
              <span>{stats.tiktok.views.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Followers</span>
              <span>{stats.tiktok.followers.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="p-4 border border-border rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Twitter</h3>
              <div className={`flex items-center ${stats.twitter.trend > 0 ? "text-green-500" : "text-red-500"}`}>
                {stats.twitter.trend > 0 ? "↑" : "↓"} {Math.abs(stats.twitter.trend)}%
              </div>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Impressions</span>
              <span>{stats.twitter.impressions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Followers</span>
              <span>{stats.twitter.followers.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="p-4 border border-border rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Reddit</h3>
              <div className={`flex items-center ${stats.reddit.trend > 0 ? "text-green-500" : "text-red-500"}`}>
                {stats.reddit.trend > 0 ? "↑" : "↓"} {Math.abs(stats.reddit.trend)}%
              </div>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Upvotes</span>
              <span>{stats.reddit.upvotes.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subscribers</span>
              <span>{stats.reddit.subscribers.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="p-4 border border-border rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Chaturbate</h3>
              <div className={`flex items-center ${stats.chaturbate.trend > 0 ? "text-green-500" : "text-red-500"}`}>
                {stats.chaturbate.trend > 0 ? "↑" : "↓"} {Math.abs(stats.chaturbate.trend)}%
              </div>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Viewers</span>
              <span>{stats.chaturbate.viewers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Followers</span>
              <span>{stats.chaturbate.followers.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <Link to={`/creators/${creatorId}/analytics`}>
              <Button className="w-full">
                <BarChart2 className="h-4 w-4 mr-2" />
                Open Full Analytics
              </Button>
            </Link>
          </div>
        </div>
      )}
      
      {!stats && (
        <div className="text-center py-6">
          <p className="text-muted-foreground">No stats available for this creator</p>
        </div>
      )}
    </div>
  );
};

export default EngagementStats;
