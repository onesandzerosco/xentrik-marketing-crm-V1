
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCreators } from "../context/creator"; 
import { ArrowLeft, Download, TrendingDown, TrendingUp, Bot, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreatorIncomeDashboard } from "@/components/analytics/CreatorIncomeDashboard";

type TimeFilter = "yesterday" | "today" | "week" | "month" | "custom";

// Generate AI performance summary based on analytics data
const generateAISummary = (stats: any, timeFilter: TimeFilter) => {
  const positivePerformers = Object.entries(stats)
    .filter(([platform, data]: [string, any]) => data.trend > 0)
    .map(([platform]) => platform);

  const negativePerformers = Object.entries(stats)
    .filter(([platform, data]: [string, any]) => data.trend < 0)
    .map(([platform]) => platform);

  let summary = "";
  
  if (positivePerformers.length > 0 && negativePerformers.length > 0) {
    summary = `Performance shows growth on ${positivePerformers.join(', ')} with a decline on ${negativePerformers.join(', ')}. Consider focusing more content on ${negativePerformers.join(', ')} to improve engagement.`;
  } else if (positivePerformers.length > 0) {
    summary = `Strong performance across ${positivePerformers.join(', ')} indicates your content strategy is working well. Continue with similar content to maintain momentum.`;
  } else if (negativePerformers.length > 0) {
    summary = `Declining metrics on ${negativePerformers.join(', ')} suggest a need for content refresh. Review recent posts and adjust strategy to better engage your audience.`;
  } else {
    summary = "Performance is stable across platforms with minimal changes. Consider testing new content formats to drive more engagement.";
  }

  return summary;
};

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

  // Fixed chart height
  const chartHeight = 400;

  // Get the list of platforms that the creator has filled in
  const availablePlatforms = Object.entries({
    instagram: creator.socialLinks.instagram,
    tiktok: creator.socialLinks.tiktok,
    twitter: creator.socialLinks.twitter,
    reddit: creator.socialLinks.reddit,
    chaturbate: creator.socialLinks.chaturbate
  }).filter(([_, value]) => !!value).map(([key]) => key);

  // Generate mock data for the charts - filter to only include platforms the creator has profiles for
  const generateFilteredData = (data: any[]) => {
    return data.map(day => {
      const filteredDay: any = { name: day.name };
      availablePlatforms.forEach(platform => {
        filteredDay[platform] = day[platform];
      });
      return filteredDay;
    });
  };

  // Weekly data
  const mockWeeklyBaseData = [
    { name: "Mon", instagram: 4000, tiktok: 2400, twitter: 2400, reddit: 1200, chaturbate: 3200 },
    { name: "Tue", instagram: 3000, tiktok: 1398, twitter: 2210, reddit: 980, chaturbate: 2900 },
    { name: "Wed", instagram: 2000, tiktok: 9800, twitter: 2290, reddit: 1308, chaturbate: 2600 },
    { name: "Thu", instagram: 2780, tiktok: 3908, twitter: 2000, reddit: 1400, chaturbate: 2200 },
    { name: "Fri", instagram: 1890, tiktok: 4800, twitter: 2181, reddit: 1500, chaturbate: 2900 },
    { name: "Sat", instagram: 2390, tiktok: 3800, twitter: 2500, reddit: 1700, chaturbate: 3400 },
    { name: "Sun", instagram: 3490, tiktok: 4300, twitter: 2100, reddit: 1200, chaturbate: 3700 }
  ];

  // Monthly data
  const mockMonthlyBaseData = [
    { name: "Week 1", instagram: 4000, tiktok: 2400, twitter: 2400, reddit: 1200, chaturbate: 3200 },
    { name: "Week 2", instagram: 3000, tiktok: 1398, twitter: 2210, reddit: 980, chaturbate: 2900 },
    { name: "Week 3", instagram: 2000, tiktok: 9800, twitter: 2290, reddit: 1308, chaturbate: 2600 },
    { name: "Week 4", instagram: 2780, tiktok: 3908, twitter: 2000, reddit: 1400, chaturbate: 2200 }
  ];

  // Daily data
  const mockDailyBaseData = [
    { name: "12am", instagram: 400, tiktok: 240, twitter: 240, reddit: 120, chaturbate: 320 },
    { name: "4am", instagram: 300, tiktok: 139, twitter: 221, reddit: 98, chaturbate: 290 },
    { name: "8am", instagram: 200, tiktok: 980, twitter: 229, reddit: 130, chaturbate: 260 },
    { name: "12pm", instagram: 278, tiktok: 390, twitter: 200, reddit: 140, chaturbate: 220 },
    { name: "4pm", instagram: 189, tiktok: 480, twitter: 218, reddit: 150, chaturbate: 290 },
    { name: "8pm", instagram: 239, tiktok: 380, twitter: 250, reddit: 170, chaturbate: 340 },
    { name: "11pm", instagram: 349, tiktok: 430, twitter: 210, reddit: 120, chaturbate: 370 }
  ];

  const mockWeeklyData = generateFilteredData(mockWeeklyBaseData);
  const mockMonthlyData = generateFilteredData(mockMonthlyBaseData);
  const mockDailyData = generateFilteredData(mockDailyBaseData);

  // Get chart data based on time filter
  const getChartData = () => {
    switch (timeFilter) {
      case "yesterday":
      case "today":
        return mockDailyData;
      case "week":
        return mockWeeklyData;
      case "month":
      default:
        return mockMonthlyData;
    }
  };

  const getChartTitle = () => {
    switch (timeFilter) {
      case "yesterday":
        return "Yesterday's Performance";
      case "today":
        return "Today's Performance";
      case "week":
        return "7-Day Performance";
      case "month":
        return "30-Day Performance";
      case "custom":
        return "Custom Time Period";
      default:
        return "Performance Metrics";
    }
  };

  const getChartDescription = () => {
    switch (timeFilter) {
      case "yesterday":
        return "Engagement across platforms for yesterday";
      case "today":
        return "Engagement across platforms for today";
      case "week":
        return "Engagement across platforms for the past week";
      case "month":
        return "Engagement across platforms for the past month";
      case "custom":
        return "Engagement across platforms for custom time period";
      default:
        return "Engagement across platforms";
    }
  };

  const renderTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
  };

  // Only render KPI cards for platforms the creator has profiles for
  const renderKpiCards = () => {
    const platformInfo = [
      { key: 'instagram', title: 'Instagram', value: stats.instagram.followers.toLocaleString(), label: 'Followers', trend: stats.instagram.trend },
      { key: 'tiktok', title: 'TikTok', value: stats.tiktok.views.toLocaleString(), label: 'Views', trend: stats.tiktok.trend },
      { key: 'twitter', title: 'Twitter', value: stats.twitter.impressions.toLocaleString(), label: 'Impressions', trend: stats.twitter.trend },
      { key: 'reddit', title: 'Reddit', value: stats.reddit.upvotes.toLocaleString(), label: 'Upvotes', trend: stats.reddit.trend },
      { key: 'chaturbate', title: 'Chaturbate', value: stats.chaturbate.viewers.toLocaleString(), label: 'Viewers', trend: stats.chaturbate.trend }
    ];

    const filteredPlatforms = platformInfo.filter(platform => 
      creator.socialLinks[platform.key as keyof typeof creator.socialLinks]
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {filteredPlatforms.map(platform => (
          <Card key={platform.key}>
            <CardHeader className="pb-2 px-4">
              <CardTitle className="text-sm font-medium">{platform.title}</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{platform.value}</p>
                  <p className="text-xs text-muted-foreground">{platform.label}</p>
                </div>
                <div className="flex items-center min-w-[60px] justify-end">
                  {renderTrendIcon(platform.trend)}
                  <span className={`ml-1 text-sm ${platform.trend > 0 ? "text-green-500" : "text-red-500"}`}>
                    {Math.abs(platform.trend)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Get AI-generated summary based on current stats and time filter
  const aiSummary = generateAISummary(stats, timeFilter);

  return (
    <div className="p-8 w-full max-w-[calc(100vw-240px)] min-h-screen bg-background">
      <div className="flex items-center mb-6">
        <Link to={`/creators/${id}`} className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{creator.name}'s Analytics</h1>
          <p className="text-muted-foreground">Performance metrics across platforms</p>
        </div>
        <Button className="ml-auto" variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </Button>
      </div>

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
        {/* Time filter toggle group */}
        <div className="mb-6">
          <ToggleGroup 
            type="single" 
            value={timeFilter}
            onValueChange={(value) => {
              if (value) setTimeFilter(value as TimeFilter);
            }}
            className="w-full max-w-md mx-auto border border-border rounded-md overflow-hidden"
          >
            <ToggleGroupItem value="yesterday" className="flex-1 rounded-none data-[state=on]:bg-blue-600">
              Yesterday
            </ToggleGroupItem>
            <ToggleGroupItem value="today" className="flex-1 rounded-none data-[state=on]:bg-blue-600">
              Today
            </ToggleGroupItem>
            <ToggleGroupItem value="week" className="flex-1 rounded-none data-[state=on]:bg-blue-600">
              This week
            </ToggleGroupItem>
            <ToggleGroupItem value="month" className="flex-1 rounded-none data-[state=on]:bg-blue-600">
              This month
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Engagement drop warning */}
        {stats.instagram.trend < -5 || stats.tiktok.trend < -5 || stats.twitter.trend < -5 || stats.reddit.trend < -5 || stats.chaturbate.trend < -5 ? (
          <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-lg mb-8">
            <h3 className="font-bold mb-1">Engagement Drop Warning</h3>
            <p>Significant engagement drop detected on some platforms. Consider reaching out to this creator.</p>
          </div>
        ) : null}

        {/* KPI cards */}
        {renderKpiCards()}

        {/* AI Performance Summary */}
        <Card className="mb-8">
          <CardHeader className="px-6 flex flex-row items-center space-y-0 pb-3">
            <div>
              <CardTitle className="flex items-center">
                <Bot className="h-5 w-5 mr-2 text-blue-500" />
                AI Performance Summary
              </CardTitle>
              <CardDescription>Smart analysis of current metrics</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <p className="text-sm">{aiSummary}</p>
          </CardContent>
        </Card>

        {/* Main Chart */}
        <Card className="mb-8">
          <CardHeader className="px-6">
            <CardTitle>{getChartTitle()}</CardTitle>
            <CardDescription>{getChartDescription()}</CardDescription>
          </CardHeader>
          <CardContent className="p-2">
            <div style={{ height: `${chartHeight}px` }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={getChartData()}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  {availablePlatforms.includes('instagram') && 
                    <Area type="monotone" dataKey="instagram" stackId="1" stroke="#8884d8" fill="#8884d8" />}
                  {availablePlatforms.includes('tiktok') && 
                    <Area type="monotone" dataKey="tiktok" stackId="2" stroke="#82ca9d" fill="#82ca9d" />}
                  {availablePlatforms.includes('twitter') && 
                    <Area type="monotone" dataKey="twitter" stackId="3" stroke="#ffc658" fill="#ffc658" />}
                  {availablePlatforms.includes('reddit') && 
                    <Area type="monotone" dataKey="reddit" stackId="4" stroke="#ff8042" fill="#ff8042" />}
                  {availablePlatforms.includes('chaturbate') && 
                    <Area type="monotone" dataKey="chaturbate" stackId="5" stroke="#0088fe" fill="#0088fe" />}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Chart */}
        <Card>
          <CardHeader className="px-6">
            <CardTitle>Platform Comparison</CardTitle>
            <CardDescription>Performance breakdown by platform</CardDescription>
          </CardHeader>
          <CardContent className="p-2">
            <div style={{ height: `${chartHeight}px` }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getChartData()}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  {availablePlatforms.includes('instagram') && 
                    <Bar dataKey="instagram" fill="#8884d8" />}
                  {availablePlatforms.includes('tiktok') && 
                    <Bar dataKey="tiktok" fill="#82ca9d" />}
                  {availablePlatforms.includes('twitter') && 
                    <Bar dataKey="twitter" fill="#ffc658" />}
                  {availablePlatforms.includes('reddit') && 
                    <Bar dataKey="reddit" fill="#ff8042" />}
                  {availablePlatforms.includes('chaturbate') && 
                    <Bar dataKey="chaturbate" fill="#0088fe" />}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="income" className="mt-0">
        <CreatorIncomeDashboard creatorId={id || ""} creatorName={creator.name} />
      </TabsContent>
    </div>
  );
};

export default CreatorAnalytics;
