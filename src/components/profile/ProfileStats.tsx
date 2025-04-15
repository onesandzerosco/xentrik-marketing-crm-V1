
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart2 } from "lucide-react";
import { EngagementStats as EngagementStatsType } from "@/types";

interface ProfileStatsProps {
  creatorId: string;
  stats?: EngagementStatsType;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ creatorId, stats }) => (
  <div className="bg-gradient-to-br from-[#1a1a33]/50 to-[#1a1a33]/30 backdrop-blur-sm p-6 rounded-xl border border-[#252538]/50 shadow-lg">
    <h2 className="text-lg font-semibold mb-4 text-white">Statistics</h2>
    {stats ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatsCard
          title="Instagram"
          trend={stats.instagram.trend}
          items={[
            { label: "Followers", value: stats.instagram.followers },
            { label: "Engagement", value: `${stats.instagram.engagement}%` }
          ]}
        />
        <StatsCard
          title="TikTok"
          trend={stats.tiktok.trend}
          items={[
            { label: "Views", value: stats.tiktok.views },
            { label: "Followers", value: stats.tiktok.followers }
          ]}
        />
        <StatsCard
          title="Twitter"
          trend={stats.twitter.trend}
          items={[
            { label: "Impressions", value: stats.twitter.impressions },
            { label: "Followers", value: stats.twitter.followers }
          ]}
        />
        <StatsCard
          title="Reddit"
          trend={stats.reddit.trend}
          items={[
            { label: "Upvotes", value: stats.reddit.upvotes },
            { label: "Subscribers", value: stats.reddit.subscribers }
          ]}
        />
        <StatsCard
          title="Chaturbate"
          trend={stats.chaturbate.trend}
          items={[
            { label: "Viewers", value: stats.chaturbate.viewers },
            { label: "Followers", value: stats.chaturbate.followers }
          ]}
        />
        <div className="md:col-span-2">
          <Link to={`/creators/${creatorId}/analytics`}>
            <Button
              className="w-full flex items-center gap-2 rounded-[15px] px-3 py-3 text-black font-medium transition-all hover:bg-gradient-premium-yellow hover:text-black hover:-translate-y-0.5 hover:shadow-premium-yellow hover:opacity-90 bg-gradient-premium-yellow shadow-premium-yellow"
              variant="default"
            >
              <BarChart2 className="h-4 w-4 mr-2" />
              Open Full Analytics
            </Button>
          </Link>
        </div>
      </div>
    ) : (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No stats available for this creator</p>
      </div>
    )}
  </div>
);

interface StatsCardProps {
  title: string;
  trend: number;
  items: Array<{ label: string; value: number | string }>;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, trend, items }) => (
  <div className="p-4 border border-[#252538] rounded-lg bg-[#1a1a33]/30">
    <div className="flex justify-between items-center mb-2">
      <h3 className="font-medium text-white">{title}</h3>
      <div className={`flex items-center ${trend > 0 ? "text-green-500" : "text-red-500"}`}>
        {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
      </div>
    </div>
    {items.map((item, index) => (
      <div key={index} className="flex justify-between text-sm text-muted-foreground">
        <span>{item.label}</span>
        <span>{typeof item.value === 'number' ? item.value.toLocaleString() : item.value}</span>
      </div>
    ))}
  </div>
);

export default ProfileStats;
