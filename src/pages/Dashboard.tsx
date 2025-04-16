
import React, { useMemo } from "react";
import { useCreators } from "../context/CreatorContext";
import { useActivities } from "../context/ActivityContext";
import RecentActivities from "../components/dashboard/RecentActivities";
import { BarChart, LineChart, PieChart, Activity, TrendingUp, Users } from "lucide-react";

const Dashboard = () => {
  const { creators } = useCreators();
  const { getRecentActivities } = useActivities();

  // Calculate totals for the dashboard
  const totalCreators = creators.length;
  const teamA = creators.filter(c => c.team === "A Team").length;
  const teamB = creators.filter(c => c.team === "B Team").length;
  const teamC = creators.filter(c => c.team === "C Team").length;
  
  const maleCreators = creators.filter(c => c.gender === "Male").length;
  const femaleCreators = creators.filter(c => c.gender === "Female").length;
  const transCreators = creators.filter(c => c.gender === "Trans").length;
  const aiCreators = creators.filter(c => c.creatorType === "AI").length;

  // Create a function to determine relative growth and team performance
  const statsData = useMemo(() => {
    // This would ideally be based on historical data from your database
    // For now, we'll create some sample change calculations
    
    // Calculate team growth rates
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Filter creators by creation date (assuming creators have timestamps in real implementation)
    // This is a placeholder - in a real implementation, you'd compare current month vs previous month
    const thisMonthCreators = creators.filter(c => c.id.includes(currentMonth.toString()));
    const previousMonthCreators = creators.filter(c => !c.id.includes(currentMonth.toString()));
    
    const totalGrowth = thisMonthCreators.length > 0 && previousMonthCreators.length > 0 
      ? Math.round((thisMonthCreators.length / previousMonthCreators.length - 1) * 100)
      : null;
    
    // Determine which team is top performing (most members relative to starting size)
    let topTeam = null;
    if (teamA > teamB && teamA > teamC) {
      topTeam = "A Team";
    } else if (teamB > teamA && teamB > teamC) {
      topTeam = "B Team";
    } else if (teamC > teamA && teamC > teamB) {
      topTeam = "C Team";
    }
    
    // Return the stats data
    return {
      totalGrowth,
      topTeam,
      teamAStatus: teamA > 0 ? "Active team" : null,
      teamBStatus: teamB > 0 ? "Growing steadily" : null,
      teamCStatus: teamC > 0 ? "New additions" : null
    };
  }, [creators, teamA, teamB, teamC]);

  // Get recent activities
  const recentActivities = getRecentActivities(3); // Show 3 most recent activities

  return (
    <div className="p-8 w-full bg-premium-dark">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-white">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your creator management system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="premium-stat-card group">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-medium text-white group-hover:text-brand-yellow transition-colors">Total Creators</h3>
            <div className="p-2 rounded-full bg-brand-yellow/10 text-brand-yellow">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="text-4xl font-bold text-white">{totalCreators}</p>
          {statsData.totalGrowth !== null && (
            <div className="text-xs text-muted-foreground mt-2">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              <span>{statsData.totalGrowth > 0 ? `+${statsData.totalGrowth}%` : `${statsData.totalGrowth}%`} from last month</span>
            </div>
          )}
        </div>
        
        <div className="premium-stat-card group">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-medium text-white group-hover:text-brand-yellow transition-colors">A Team</h3>
            <div className="p-2 rounded-full bg-brand-yellow/10 text-brand-yellow">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <p className="text-4xl font-bold text-white">{teamA}</p>
          {statsData.topTeam === "A Team" && (
            <div className="text-xs text-muted-foreground mt-2">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              <span>Top performing team</span>
            </div>
          )}
          {statsData.topTeam !== "A Team" && statsData.teamAStatus && (
            <div className="text-xs text-muted-foreground mt-2">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              <span>{statsData.teamAStatus}</span>
            </div>
          )}
        </div>
        
        <div className="premium-stat-card group">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-medium text-white group-hover:text-brand-yellow transition-colors">B Team</h3>
            <div className="p-2 rounded-full bg-brand-yellow/10 text-brand-yellow">
              <PieChart className="h-5 w-5" />
            </div>
          </div>
          <p className="text-4xl font-bold text-white">{teamB}</p>
          {statsData.topTeam === "B Team" && (
            <div className="text-xs text-muted-foreground mt-2">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              <span>Top performing team</span>
            </div>
          )}
          {statsData.topTeam !== "B Team" && statsData.teamBStatus && (
            <div className="text-xs text-muted-foreground mt-2">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              <span>{statsData.teamBStatus}</span>
            </div>
          )}
        </div>
        
        <div className="premium-stat-card group">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-medium text-white group-hover:text-brand-yellow transition-colors">C Team</h3>
            <div className="p-2 rounded-full bg-brand-yellow/10 text-brand-yellow">
              <BarChart className="h-5 w-5" />
            </div>
          </div>
          <p className="text-4xl font-bold text-white">{teamC}</p>
          {statsData.topTeam === "C Team" && (
            <div className="text-xs text-muted-foreground mt-2">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              <span>Top performing team</span>
            </div>
          )}
          {statsData.topTeam !== "C Team" && statsData.teamCStatus && (
            <div className="text-xs text-muted-foreground mt-2">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              <span>{statsData.teamCStatus}</span>
            </div>
          )}
        </div>
      </div>

      <div className="premium-card mb-8 hover:border-brand-yellow/50">
        <h2 className="text-xl font-bold mb-6 text-white flex items-center">
          <LineChart className="h-5 w-5 mr-2 text-brand-yellow" />
          Creator Distribution
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-4 rounded-lg bg-premium-darker/50 border border-premium-border hover:border-brand-yellow/30 transition-all">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Male</h3>
            <p className="text-2xl font-bold text-white">{maleCreators}</p>
          </div>
          <div className="p-4 rounded-lg bg-premium-darker/50 border border-premium-border hover:border-brand-yellow/30 transition-all">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Female</h3>
            <p className="text-2xl font-bold text-white">{femaleCreators}</p>
          </div>
          <div className="p-4 rounded-lg bg-premium-darker/50 border border-premium-border hover:border-brand-yellow/30 transition-all">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Trans</h3>
            <p className="text-2xl font-bold text-white">{transCreators}</p>
          </div>
          <div className="p-4 rounded-lg bg-premium-darker/50 border border-premium-border hover:border-brand-yellow/30 transition-all">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">AI</h3>
            <p className="text-2xl font-bold text-white">{aiCreators}</p>
          </div>
        </div>
      </div>

      <div className="premium-card hover:border-brand-yellow/50">
        <h2 className="text-xl font-bold mb-4 text-white flex items-center">
          <Activity className="h-5 w-5 mr-2 text-brand-yellow" />
          Recent Activities
        </h2>
        <RecentActivities activities={recentActivities} />
      </div>
    </div>
  );
};

export default Dashboard;
