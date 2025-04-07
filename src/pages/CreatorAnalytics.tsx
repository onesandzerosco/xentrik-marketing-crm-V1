
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCreators } from "../context/CreatorContext";
import Sidebar from "../components/Sidebar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Download, UserCog } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const CreatorAnalytics = () => {
  const { id } = useParams<{ id: string }>();
  const { getCreator, getCreatorStats } = useCreators();
  const [timeframe, setTimeframe] = useState<"7day" | "30day">("7day");
  
  const creator = getCreator(id!);
  const stats = getCreatorStats(id!);
  
  // Mock data for charts
  const mockDailyData = [
    { name: "Mon", instagram: 5200, tiktok: 15000, twitter: 3800, reddit: 1200, chaturbate: 2000 },
    { name: "Tue", instagram: 5800, tiktok: 17000, twitter: 4100, reddit: 1300, chaturbate: 2200 },
    { name: "Wed", instagram: 6500, tiktok: 18000, twitter: 4500, reddit: 1500, chaturbate: 2500 },
    { name: "Thu", instagram: 6200, tiktok: 16500, twitter: 4200, reddit: 1400, chaturbate: 2300 },
    { name: "Fri", instagram: 6800, tiktok: 19000, twitter: 4700, reddit: 1600, chaturbate: 2600 },
    { name: "Sat", instagram: 7500, tiktok: 22000, twitter: 5200, reddit: 1900, chaturbate: 3000 },
    { name: "Sun", instagram: 7200, tiktok: 21000, twitter: 5000, reddit: 1800, chaturbate: 2800 },
  ];
  
  const mockMonthlyData = [
    { name: "Week 1", instagram: 35000, tiktok: 120000, twitter: 28000, reddit: 10000, chaturbate: 18000 },
    { name: "Week 2", instagram: 38000, tiktok: 135000, twitter: 31000, reddit: 11000, chaturbate: 20000 },
    { name: "Week 3", instagram: 42000, tiktok: 155000, twitter: 35000, reddit: 12500, chaturbate: 22000 },
    { name: "Week 4", instagram: 45000, tiktok: 175000, twitter: 38000, reddit: 14000, chaturbate: 24000 },
  ];
  
  const chartData = timeframe === "7day" ? mockDailyData : mockMonthlyData;
  
  // Check for significant performance drops
  const hasPerformanceDrop = stats && (
    stats.instagram.trend < -30 ||
    stats.tiktok.trend < -30 ||
    stats.twitter.trend < -30 ||
    stats.reddit.trend < -30 ||
    stats.chaturbate.trend < -30
  );

  if (!creator) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="ml-60 p-8 w-full">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">Creator not found</h3>
            <p className="text-muted-foreground mb-4">The creator you're looking for doesn't exist</p>
            <Link to="/creators">
              <Button>Return to creators</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-60 p-8 w-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{creator.name}'s Analytics</h1>
            <p className="text-muted-foreground">
              Performance metrics across all platforms
            </p>
          </div>
          <div className="flex gap-3">
            <Link to={`/creators/${creator.id}`}>
              <Button variant="outline">
                <UserCog className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </Link>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </div>

        {hasPerformanceDrop && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Performance Alert</AlertTitle>
            <AlertDescription>
              This creator has experienced a significant drop in engagement (>30%) on one or more platforms.
              Immediate action may be required.
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-6">
          <Tabs defaultValue="7day" onValueChange={(value) => setTimeframe(value as "7day" | "30day")}>
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="7day">Last 7 Days</TabsTrigger>
                <TabsTrigger value="30day">Last 30 Days</TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats && (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Instagram</CardTitle>
                  <CardDescription>
                    Engagement rate: {stats.instagram.engagement}%
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.instagram.followers.toLocaleString()} followers
                  </div>
                  <div className={`text-sm flex items-center ${stats.instagram.trend > 0 ? "text-green-500" : "text-red-500"}`}>
                    {stats.instagram.trend > 0 ? "↑" : "↓"} {Math.abs(stats.instagram.trend)}% from last period
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">TikTok</CardTitle>
                  <CardDescription>
                    Average views per video
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.tiktok.views.toLocaleString()} views
                  </div>
                  <div className={`text-sm flex items-center ${stats.tiktok.trend > 0 ? "text-green-500" : "text-red-500"}`}>
                    {stats.tiktok.trend > 0 ? "↑" : "↓"} {Math.abs(stats.tiktok.trend)}% from last period
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Twitter</CardTitle>
                  <CardDescription>
                    Impressions per tweet
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.twitter.impressions.toLocaleString()} impressions
                  </div>
                  <div className={`text-sm flex items-center ${stats.twitter.trend > 0 ? "text-green-500" : "text-red-500"}`}>
                    {stats.twitter.trend > 0 ? "↑" : "↓"} {Math.abs(stats.twitter.trend)}% from last period
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Comparison</CardTitle>
              <CardDescription>
                Platform performance for {timeframe === "7day" ? "the last 7 days" : "the last 30 days"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="name" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "rgba(25, 25, 28, 0.9)", 
                        borderColor: "#333",
                        color: "#fff"
                      }} 
                    />
                    <Legend />
                    <Line type="monotone" dataKey="instagram" stroke="#E1306C" name="Instagram" strokeWidth={2} />
                    <Line type="monotone" dataKey="tiktok" stroke="#69C9D0" name="TikTok" strokeWidth={2} />
                    <Line type="monotone" dataKey="twitter" stroke="#1DA1F2" name="Twitter" strokeWidth={2} />
                    <Line type="monotone" dataKey="reddit" stroke="#FF4500" name="Reddit" strokeWidth={2} />
                    <Line type="monotone" dataKey="chaturbate" stroke="#F78642" name="Chaturbate" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Platform Distribution</CardTitle>
              <CardDescription>
                Relative engagement across platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData.slice(-1)} // Use only the most recent data
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis type="number" stroke="#888" />
                    <YAxis dataKey="name" type="category" stroke="#888" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "rgba(25, 25, 28, 0.9)", 
                        borderColor: "#333",
                        color: "#fff"
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="instagram" fill="#E1306C" name="Instagram" />
                    <Bar dataKey="tiktok" fill="#69C9D0" name="TikTok" />
                    <Bar dataKey="twitter" fill="#1DA1F2" name="Twitter" />
                    <Bar dataKey="reddit" fill="#FF4500" name="Reddit" />
                    <Bar dataKey="chaturbate" fill="#F78642" name="Chaturbate" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Content</CardTitle>
              <CardDescription>
                Posts with highest engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start p-3 border border-border rounded-lg">
                  <div className="w-12 h-12 rounded bg-blue-900/30 flex items-center justify-center mr-3">
                    <span className="text-xl">📷</span>
                  </div>
                  <div>
                    <p className="font-medium">Beach photoshoot highlights</p>
                    <p className="text-sm text-muted-foreground">Instagram • 3.2k likes</p>
                  </div>
                </div>
                <div className="flex items-start p-3 border border-border rounded-lg">
                  <div className="w-12 h-12 rounded bg-cyan-900/30 flex items-center justify-center mr-3">
                    <span className="text-xl">🎵</span>
                  </div>
                  <div>
                    <p className="font-medium">Trending dance challenge</p>
                    <p className="text-sm text-muted-foreground">TikTok • 45.8k views</p>
                  </div>
                </div>
                <div className="flex items-start p-3 border border-border rounded-lg">
                  <div className="w-12 h-12 rounded bg-red-900/30 flex items-center justify-center mr-3">
                    <span className="text-xl">👽</span>
                  </div>
                  <div>
                    <p className="font-medium">AMA Thread</p>
                    <p className="text-sm text-muted-foreground">Reddit • 876 upvotes</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>
                AI-generated suggestions for improvement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 border border-yellow-800/30 bg-yellow-900/10 rounded-lg">
                  <p className="font-medium mb-1">Increase Instagram posting frequency</p>
                  <p className="text-sm text-muted-foreground">
                    Currently posting 2x weekly, recommend increasing to 4-5x for higher engagement.
                  </p>
                </div>
                <div className="p-3 border border-green-800/30 bg-green-900/10 rounded-lg">
                  <p className="font-medium mb-1">TikTok content is performing well</p>
                  <p className="text-sm text-muted-foreground">
                    Continue with trending sound strategy, engagement is 35% above average.
                  </p>
                </div>
                <div className="p-3 border border-red-800/30 bg-red-900/10 rounded-lg">
                  <p className="font-medium mb-1">Twitter engagement dropping</p>
                  <p className="text-sm text-muted-foreground">
                    Schedule more interactive polls and questions to increase follower engagement.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreatorAnalytics;
