
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCreators } from "../context/CreatorContext";
import Sidebar from "../components/Sidebar";
import { ArrowLeft, Download, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

type TimeFilter = "yesterday" | "today" | "week" | "month" | "custom";

// Define platform colors to match your design
const PLATFORM_COLORS = {
  instagram: "#8884d8", // Purple for Instagram
  tiktok: "#82ca9d", // Green for TikTok
  twitter: "#ffc658", // Yellow/Gold for Twitter
  reddit: "#ff8042", // Orange for Reddit
  chaturbate: "#0088fe", // Blue for Chaturbate
};

const CreatorAnalytics = () => {
  const { id } = useParams();
  const { getCreator, getCreatorStats } = useCreators();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("week");
  
  const creator = getCreator(id || "");
  const stats = getCreatorStats(id || "");
  
  if (!creator || !stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Creator not found or no stats available.</p>
      </div>
    );
  }

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

  // Config for chart themes
  const chartConfig = availablePlatforms.reduce((config, platform) => {
    config[platform] = { 
      color: PLATFORM_COLORS[platform as keyof typeof PLATFORM_COLORS],
      label: platform.charAt(0).toUpperCase() + platform.slice(1)
    };
    return config;
  }, {} as Record<string, { color: string, label: string }>);

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
          <Card key={platform.key} className="overflow-hidden border-0 shadow-md bg-card">
            <CardHeader className="pb-2 px-4">
              <CardTitle className="text-sm font-medium">{platform.title}</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{platform.value}</p>
                  <p className="text-xs text-muted-foreground">{platform.label}</p>
                </div>
                <div className="flex items-center gap-1 justify-end">
                  {renderTrendIcon(platform.trend)}
                  <span className={`text-sm ${platform.trend > 0 ? "text-green-500" : "text-red-500"}`}>
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

  // Generate an AI summary of the creator's performance
  const generateAiSummary = () => {
    // Calculate overall trend average across all platforms
    let totalTrend = 0;
    let platformCount = 0;
    
    availablePlatforms.forEach(platform => {
      const platformKey = platform as keyof typeof stats;
      const trend = stats[platformKey].trend;
      totalTrend += trend;
      platformCount++;
    });
    
    const averageTrend = platformCount > 0 ? totalTrend / platformCount : 0;
    
    // Generate a contextual summary based on the average trend
    if (averageTrend > 5) {
      return `${creator.name} is showing strong growth across their platforms with an average increase of ${averageTrend.toFixed(1)}%. Their content strategy appears to be working well, particularly on ${getTopPerformingPlatform()}.`;
    } else if (averageTrend > 0) {
      return `${creator.name} is maintaining steady growth with a modest average increase of ${averageTrend.toFixed(1)}% across platforms. Their ${getTopPerformingPlatform()} content is performing best while ${getLowestPerformingPlatform()} could use more attention.`;
    } else if (averageTrend > -5) {
      return `${creator.name} is experiencing slight declines with an average change of ${averageTrend.toFixed(1)}% across platforms. Consider reviewing their content strategy, particularly for ${getLowestPerformingPlatform()}.`;
    } else {
      return `${creator.name} is showing concerning performance drops averaging ${averageTrend.toFixed(1)}% across platforms. Immediate attention is needed, especially for their ${getLowestPerformingPlatform()} content strategy.`;
    }
  };
  
  // Helper function to get the top performing platform
  const getTopPerformingPlatform = () => {
    let topPlatform = '';
    let topTrend = -Infinity;
    
    availablePlatforms.forEach(platform => {
      const platformKey = platform as keyof typeof stats;
      const trend = stats[platformKey].trend;
      if (trend > topTrend) {
        topTrend = trend;
        topPlatform = platform;
      }
    });
    
    return topPlatform;
  };
  
  // Helper function to get the lowest performing platform
  const getLowestPerformingPlatform = () => {
    let lowestPlatform = '';
    let lowestTrend = Infinity;
    
    availablePlatforms.forEach(platform => {
      const platformKey = platform as keyof typeof stats;
      const trend = stats[platformKey].trend;
      if (trend < lowestTrend) {
        lowestTrend = trend;
        lowestPlatform = platform;
      }
    });
    
    return lowestPlatform;
  };

  // Render figures box for platforms in a clean, styled format
  const renderFiguresBox = () => {
    if (!availablePlatforms.length) return null;
    
    return (
      <Card className="mb-8 border-0 shadow-lg overflow-hidden bg-card relative">
        <CardHeader className="bg-card/80 backdrop-blur-sm px-6 py-4 border-b border-border/30">
          <CardTitle className="text-lg">Platform Figures</CardTitle>
          <CardDescription>Current engagement metrics</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4">
            {availablePlatforms.map(platform => {
              const platformKey = platform as keyof typeof stats;
              const platformData = stats[platformKey];
              
              let displayValue = 0;
              
              if (platform === 'instagram') {
                displayValue = platformData.followers;
              } else if (platform === 'tiktok') {
                displayValue = 'views' in platformData ? platformData.views : 0;
              } else if (platform === 'twitter') {
                displayValue = 'impressions' in platformData ? platformData.impressions : 0;
              } else if (platform === 'reddit') {
                displayValue = 'upvotes' in platformData ? platformData.upvotes : 0;
              } else if (platform === 'chaturbate') {
                displayValue = 'viewers' in platformData ? platformData.viewers : 0;
              }
              
              return (
                <div 
                  key={platform} 
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ 
                    background: `linear-gradient(90deg, ${PLATFORM_COLORS[platform as keyof typeof PLATFORM_COLORS]}20 0%, transparent 100%)`,
                    borderLeft: `4px solid ${PLATFORM_COLORS[platform as keyof typeof PLATFORM_COLORS]}`
                  }}
                >
                  <span className="text-lg font-medium" style={{ color: PLATFORM_COLORS[platform as keyof typeof PLATFORM_COLORS] }}>
                    {platform}
                  </span>
                  <span className="text-xl font-bold">
                    {displayValue.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-60 p-8 w-full max-w-[calc(100vw-240px)]">
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
            <ToggleGroupItem value="yesterday" className="flex-1 rounded-none data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
              Yesterday
            </ToggleGroupItem>
            <ToggleGroupItem value="today" className="flex-1 rounded-none data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
              Today
            </ToggleGroupItem>
            <ToggleGroupItem value="week" className="flex-1 rounded-none data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
              This week
            </ToggleGroupItem>
            <ToggleGroupItem value="month" className="flex-1 rounded-none data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
              This month
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* AI Summary */}
        <Card className="mb-8 border-0 shadow-lg overflow-hidden bg-gradient-to-r from-purple-900/20 to-blue-900/20">
          <CardHeader className="px-6 py-4">
            <CardTitle className="flex items-center">
              <span className="mr-2">AI Performance Insight</span>
              <span className="text-xs px-2 py-1 bg-primary/20 rounded-full text-primary">AI Generated</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <p className="text-lg">{generateAiSummary()}</p>
          </CardContent>
        </Card>

        {/* Engagement drop warning */}
        {stats.instagram.trend < -5 || stats.tiktok.trend < -5 || stats.twitter.trend < -5 || stats.reddit.trend < -5 || stats.chaturbate.trend < -5 ? (
          <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-lg mb-8">
            <h3 className="font-bold mb-1">Engagement Drop Warning</h3>
            <p>Significant engagement drop detected on some platforms. Consider reaching out to this creator.</p>
          </div>
        ) : null}

        {/* KPI cards */}
        {renderKpiCards()}

        {/* Figures Box */}
        {renderFiguresBox()}

        {/* Main Chart */}
        <Card className="mb-8 border-0 shadow-lg overflow-hidden">
          <CardHeader className="px-6 bg-card/80 backdrop-blur-sm border-b border-border/30">
            <CardTitle>{getChartTitle()}</CardTitle>
            <CardDescription>{getChartDescription()}</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-80">
              <ChartContainer 
                config={chartConfig} 
                className="[&_.recharts-cartesian-grid-horizontal_line]:stroke-muted/20 [&_.recharts-cartesian-grid-vertical_line]:stroke-muted/20 [&_.recharts-cartesian-axis-line]:stroke-muted [&_.recharts-cartesian-axis-tick-line]:stroke-muted [&_.recharts-cartesian-axis-tick-value]:fill-muted-foreground"
              >
                <AreaChart
                  data={getChartData()}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    stroke="currentColor" 
                    fontSize={12} 
                    tickLine={true} 
                    axisLine={true} 
                  />
                  <YAxis 
                    stroke="currentColor" 
                    fontSize={12} 
                    tickLine={true} 
                    axisLine={true} 
                  />
                  <ChartTooltip 
                    content={({active, payload}) => 
                      active && payload?.length ? (
                        <ChartTooltipContent 
                          className="border-0 shadow-lg" 
                          payload={payload} 
                        />
                      ) : null
                    } 
                  />
                  {availablePlatforms.includes('instagram') && 
                    <Area 
                      type="monotone" 
                      dataKey="instagram" 
                      stroke={PLATFORM_COLORS.instagram} 
                      fill={`${PLATFORM_COLORS.instagram}80`} 
                      fillOpacity={0.6}
                    />
                  }
                  {availablePlatforms.includes('tiktok') && 
                    <Area 
                      type="monotone" 
                      dataKey="tiktok" 
                      stroke={PLATFORM_COLORS.tiktok} 
                      fill={`${PLATFORM_COLORS.tiktok}80`} 
                      fillOpacity={0.6}
                    />
                  }
                  {availablePlatforms.includes('twitter') && 
                    <Area 
                      type="monotone" 
                      dataKey="twitter" 
                      stroke={PLATFORM_COLORS.twitter} 
                      fill={`${PLATFORM_COLORS.twitter}80`} 
                      fillOpacity={0.6}
                    />
                  }
                  {availablePlatforms.includes('reddit') && 
                    <Area 
                      type="monotone" 
                      dataKey="reddit" 
                      stroke={PLATFORM_COLORS.reddit} 
                      fill={`${PLATFORM_COLORS.reddit}80`} 
                      fillOpacity={0.6}
                    />
                  }
                  {availablePlatforms.includes('chaturbate') && 
                    <Area 
                      type="monotone" 
                      dataKey="chaturbate" 
                      stroke={PLATFORM_COLORS.chaturbate} 
                      fill={`${PLATFORM_COLORS.chaturbate}80`} 
                      fillOpacity={0.6}
                    />
                  }
                </AreaChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Platform Comparison Chart */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="px-6 bg-card/80 backdrop-blur-sm border-b border-border/30">
            <CardTitle>Platform Comparison</CardTitle>
            <CardDescription>Performance breakdown by platform</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-80">
              <ChartContainer 
                config={chartConfig}
                className="[&_.recharts-cartesian-grid-horizontal_line]:stroke-muted/20 [&_.recharts-cartesian-grid-vertical_line]:stroke-muted/20 [&_.recharts-cartesian-axis-line]:stroke-muted [&_.recharts-cartesian-axis-tick-line]:stroke-muted [&_.recharts-cartesian-axis-tick-value]:fill-muted-foreground"
              >
                <BarChart
                  data={getChartData()}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    stroke="currentColor" 
                    fontSize={12} 
                    tickLine={true} 
                    axisLine={true}
                  />
                  <YAxis 
                    stroke="currentColor" 
                    fontSize={12} 
                    tickLine={true} 
                    axisLine={true}
                  />
                  <ChartTooltip 
                    content={({active, payload}) => 
                      active && payload?.length ? (
                        <ChartTooltipContent 
                          className="border-0 shadow-lg" 
                          payload={payload} 
                        />
                      ) : null
                    } 
                  />
                  {availablePlatforms.includes('instagram') && 
                    <Bar dataKey="instagram" fill={PLATFORM_COLORS.instagram} radius={[4, 4, 0, 0]} />}
                  {availablePlatforms.includes('tiktok') && 
                    <Bar dataKey="tiktok" fill={PLATFORM_COLORS.tiktok} radius={[4, 4, 0, 0]} />}
                  {availablePlatforms.includes('twitter') && 
                    <Bar dataKey="twitter" fill={PLATFORM_COLORS.twitter} radius={[4, 4, 0, 0]} />}
                  {availablePlatforms.includes('reddit') && 
                    <Bar dataKey="reddit" fill={PLATFORM_COLORS.reddit} radius={[4, 4, 0, 0]} />}
                  {availablePlatforms.includes('chaturbate') && 
                    <Bar dataKey="chaturbate" fill={PLATFORM_COLORS.chaturbate} radius={[4, 4, 0, 0]} />}
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreatorAnalytics;
