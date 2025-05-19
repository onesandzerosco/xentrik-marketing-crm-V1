
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useCreators } from "../context/creator"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreatorIncomeDashboard } from "@/components/analytics/CreatorIncomeDashboard";
import { EngagementDashboard } from "@/components/analytics/EngagementDashboard";
import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader";
import { TimeFilter } from "@/types";

const CreatorAnalytics = () => {
  const { id } = useParams();
  const { getCreator, getCreatorStats } = useCreators();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("week");
  const [activeTab, setActiveTab] = useState<string>("engagement");
  
  const creator = getCreator(id || "");
  const stats = getCreatorStats(id || "");
  
  if (!creator || !stats) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <p>Creator not found or no stats available.</p>
      </div>
    );
  }

  return (
    <div className="p-8 w-full max-w-[calc(100vw-240px)] min-h-screen bg-background">
      <AnalyticsHeader creatorId={id || ""} creatorName={creator.name} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="w-full max-w-md mx-auto">
          <TabsTrigger value="engagement" className="flex-1">
            Engagement
          </TabsTrigger>
          <TabsTrigger value="income" className="flex-1">
            Income
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <TabsContent value="engagement" className="mt-0">
        <EngagementDashboard 
          creator={creator} 
          stats={stats} 
          timeFilter={timeFilter} 
          setTimeFilter={setTimeFilter}
        />
      </TabsContent>

      <TabsContent value="income" className="mt-0">
        <CreatorIncomeDashboard creatorId={id || ""} creatorName={creator.name} />
      </TabsContent>
    </div>
  );
};

export default CreatorAnalytics;
