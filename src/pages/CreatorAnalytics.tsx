
import React from "react";
import { useParams, Link } from "react-router-dom";
import { useCreators } from "../context/CreatorContext";
import Sidebar from "../components/Sidebar";
import { ArrowLeft, Download, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const CreatorAnalytics = () => {
  const { id } = useParams();
  const { getCreator, getCreatorStats } = useCreators();
  
  const creator = getCreator(id || "");
  const stats = getCreatorStats(id || "");
  
  if (!creator || !stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Creator not found or no stats available.</p>
      </div>
    );
  }

  // Generate mock data for the charts
  const mockWeeklyData = [
    { name: "Mon", instagram: 4000, tiktok: 2400, twitter: 2400, reddit: 1200, chaturbate: 3200 },
    { name: "Tue", instagram: 3000, tiktok: 1398, twitter: 2210, reddit: 980, chaturbate: 2900 },
    { name: "Wed", instagram: 2000, tiktok: 9800, twitter: 2290, reddit: 1308, chaturbate: 2600 },
    { name: "Thu", instagram: 2780, tiktok: 3908, twitter: 2000, reddit: 1400, chaturbate: 2200 },
    { name: "Fri", instagram: 1890, tiktok: 4800, twitter: 2181, reddit: 1500, chaturbate: 2900 },
    { name: "Sat", instagram: 2390, tiktok: 3800, twitter: 2500, reddit: 1700, chaturbate: 3400 },
    { name: "Sun", instagram: 3490, tiktok: 4300, twitter: 2100, reddit: 1200, chaturbate: 3700 }
  ];

  const mockMonthlyData = [
    { name: "Week 1", instagram: 4000, tiktok: 2400, twitter: 2400, reddit: 1200, chaturbate: 3200 },
    { name: "Week 2", instagram: 3000, tiktok: 1398, twitter: 2210, reddit: 980, chaturbate: 2900 },
    { name: "Week 3", instagram: 2000, tiktok: 9800, twitter: 2290, reddit: 1308, chaturbate: 2600 },
    { name: "Week 4", instagram: 2780, tiktok: 3908, twitter: 2000, reddit: 1400, chaturbate: 2200 }
  ];

  const renderTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-60 p-8 w-full">
        <div className="flex items-center mb-8">
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

        {/* Engagement drop warning */}
        {stats.instagram.trend < -5 || stats.tiktok.trend < -5 || stats.twitter.trend < -5 || stats.reddit.trend < -5 || stats.chaturbate.trend < -5 ? (
          <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-lg mb-8">
            <h3 className="font-bold mb-1">Engagement Drop Warning</h3>
            <p>Significant engagement drop detected on some platforms. Consider reaching out to this creator.</p>
          </div>
        ) : null}

        {/* KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Instagram</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{stats.instagram.followers.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Followers</p>
                </div>
                <div className="flex items-center">
                  {renderTrendIcon(stats.instagram.trend)}
                  <span className={`ml-1 text-sm ${stats.instagram.trend > 0 ? "text-green-500" : "text-red-500"}`}>
                    {Math.abs(stats.instagram.trend)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">TikTok</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{stats.tiktok.views.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Views</p>
                </div>
                <div className="flex items-center">
                  {renderTrendIcon(stats.tiktok.trend)}
                  <span className={`ml-1 text-sm ${stats.tiktok.trend > 0 ? "text-green-500" : "text-red-500"}`}>
                    {Math.abs(stats.tiktok.trend)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Twitter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{stats.twitter.impressions.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Impressions</p>
                </div>
                <div className="flex items-center">
                  {renderTrendIcon(stats.twitter.trend)}
                  <span className={`ml-1 text-sm ${stats.twitter.trend > 0 ? "text-green-500" : "text-red-500"}`}>
                    {Math.abs(stats.twitter.trend)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Reddit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{stats.reddit.upvotes.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Upvotes</p>
                </div>
                <div className="flex items-center">
                  {renderTrendIcon(stats.reddit.trend)}
                  <span className={`ml-1 text-sm ${stats.reddit.trend > 0 ? "text-green-500" : "text-red-500"}`}>
                    {Math.abs(stats.reddit.trend)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Chaturbate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{stats.chaturbate.viewers.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Viewers</p>
                </div>
                <div className="flex items-center">
                  {renderTrendIcon(stats.chaturbate.trend)}
                  <span className={`ml-1 text-sm ${stats.chaturbate.trend > 0 ? "text-green-500" : "text-red-500"}`}>
                    {Math.abs(stats.chaturbate.trend)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>7-Day Performance</CardTitle>
            <CardDescription>Engagement across platforms for the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={mockWeeklyData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="instagram" stackId="1" stroke="#8884d8" fill="#8884d8" />
                  <Area type="monotone" dataKey="tiktok" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
                  <Area type="monotone" dataKey="twitter" stackId="3" stroke="#ffc658" fill="#ffc658" />
                  <Area type="monotone" dataKey="reddit" stackId="4" stroke="#ff8042" fill="#ff8042" />
                  <Area type="monotone" dataKey="chaturbate" stackId="5" stroke="#0088fe" fill="#0088fe" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Chart */}
        <Card>
          <CardHeader>
            <CardTitle>30-Day Growth</CardTitle>
            <CardDescription>Monthly performance breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mockMonthlyData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="instagram" fill="#8884d8" />
                  <Bar dataKey="tiktok" fill="#82ca9d" />
                  <Bar dataKey="twitter" fill="#ffc658" />
                  <Bar dataKey="reddit" fill="#ff8042" />
                  <Bar dataKey="chaturbate" fill="#0088fe" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreatorAnalytics;
