import React, { useState, useEffect } from "react";
import { useCreators } from "../context/CreatorContext";
import { useActivities } from "../context/ActivityContext";
import RecentActivities from "../components/dashboard/RecentActivities";
import { BarChart, LineChart, PieChart, Activity, TrendingUp, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import styles from "@/styles/animations.module.css";

const Dashboard = () => {
  const { creators } = useCreators();
  const { getRecentActivities } = useActivities();
  const { toast } = useToast();
  const [dashboardStats, setDashboardStats] = useState({
    totalCreators: 0,
    teamA: 0,
    teamB: 0,
    teamC: 0,
    maleCreators: 0,
    femaleCreators: 0,
    transCreators: 0,
    aiCreators: 0,
    statsData: {
      totalGrowth: null,
      topTeam: null,
      teamAStatus: null,
      teamBStatus: null,
      teamCStatus: null
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const firstDayCurrentMonth = new Date(currentYear, currentMonth, 1);
        const firstDayPreviousMonth = new Date(currentYear, currentMonth - 1, 1);
        
        const currentMonthStart = firstDayCurrentMonth.toISOString();
        const previousMonthStart = firstDayPreviousMonth.toISOString();
        
        const { data: creatorsData, error: creatorsError } = await supabase
          .from('creators')
          .select('id, team, gender, creator_type, created_at');
          
        if (creatorsError) {
          console.error('Error fetching creators:', creatorsError);
          toast({
            title: "Failed to load dashboard data",
            description: "There was an error fetching dashboard information",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        const totalCreators = creatorsData.length;
        const teamA = creatorsData.filter(c => c.team === "A Team").length;
        const teamB = creatorsData.filter(c => c.team === "B Team").length;
        const teamC = creatorsData.filter(c => c.team === "C Team").length;
        const maleCreators = creatorsData.filter(c => c.gender === "Male").length;
        const femaleCreators = creatorsData.filter(c => c.gender === "Female").length;
        const transCreators = creatorsData.filter(c => c.gender === "Trans").length;
        const aiCreators = creatorsData.filter(c => c.creator_type === "AI").length;
        
        const thisMonthCreators = creatorsData.filter(c => 
          new Date(c.created_at) >= firstDayCurrentMonth
        ).length;
        
        const previousMonthCreators = creatorsData.filter(c =>
          new Date(c.created_at) >= firstDayPreviousMonth && 
          new Date(c.created_at) < firstDayCurrentMonth
        ).length;
        
        let totalGrowth = null;
        if (previousMonthCreators > 0) {
          totalGrowth = Math.round(((thisMonthCreators / previousMonthCreators) - 1) * 100);
        }
        
        const teamAStatus = teamA > 0 ? "Active team" : null;
        const teamBStatus = teamB > 0 ? "Growing steadily" : null;
        const teamCStatus = teamC > 0 ? "New additions" : null;
        
        let topTeam = null;
        if (teamA > teamB && teamA > teamC) {
          topTeam = "A Team";
        } else if (teamB > teamA && teamB > teamC) {
          topTeam = "B Team";
        } else if (teamC > teamA && teamC > teamB) {
          topTeam = "C Team";
        }
        
        setDashboardStats({
          totalCreators,
          teamA,
          teamB,
          teamC,
          maleCreators,
          femaleCreators,
          transCreators,
          aiCreators,
          statsData: {
            totalGrowth,
            topTeam,
            teamAStatus,
            teamBStatus,
            teamCStatus
          }
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error in dashboard data fetch:', error);
        toast({
          title: "Error loading dashboard",
          description: "Failed to retrieve dashboard statistics",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
    
    const intervalId = setInterval(() => {
      fetchDashboardData();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [toast]);
  
  const recentActivities = getRecentActivities(3);

  const { 
    totalCreators, 
    teamA, 
    teamB, 
    teamC, 
    maleCreators, 
    femaleCreators,
    transCreators,
    aiCreators,
    statsData 
  } = dashboardStats;

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
          <p className="text-4xl font-bold text-white">{isLoading ? '...' : totalCreators}</p>
          {!isLoading && statsData.totalGrowth !== null && (
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
          <p className="text-4xl font-bold text-white">{isLoading ? '...' : teamA}</p>
          {!isLoading && statsData.topTeam === "A Team" && (
            <div className="text-xs text-muted-foreground mt-2">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              <span>Top performing team</span>
            </div>
          )}
          {!isLoading && statsData.topTeam !== "A Team" && statsData.teamAStatus && (
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
          <p className="text-4xl font-bold text-white">{isLoading ? '...' : teamB}</p>
          {!isLoading && statsData.topTeam === "B Team" && (
            <div className="text-xs text-muted-foreground mt-2">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              <span>Top performing team</span>
            </div>
          )}
          {!isLoading && statsData.topTeam !== "B Team" && statsData.teamBStatus && (
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
          <p className="text-4xl font-bold text-white">{isLoading ? '...' : teamC}</p>
          {!isLoading && statsData.topTeam === "C Team" && (
            <div className="text-xs text-muted-foreground mt-2">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              <span>Top performing team</span>
            </div>
          )}
          {!isLoading && statsData.topTeam !== "C Team" && statsData.teamCStatus && (
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
            <p className="text-2xl font-bold text-white">{isLoading ? '...' : maleCreators}</p>
          </div>
          <div className="p-4 rounded-lg bg-premium-darker/50 border border-premium-border hover:border-brand-yellow/30 transition-all">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Female</h3>
            <p className="text-2xl font-bold text-white">{isLoading ? '...' : femaleCreators}</p>
          </div>
          <div className="p-4 rounded-lg bg-premium-darker/50 border border-premium-border hover:border-brand-yellow/30 transition-all">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Trans</h3>
            <p className="text-2xl font-bold text-white">{isLoading ? '...' : transCreators}</p>
          </div>
          <div className="p-4 rounded-lg bg-premium-darker/50 border border-premium-border hover:border-brand-yellow/30 transition-all">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">AI</h3>
            <p className="text-2xl font-bold text-white">{isLoading ? '...' : aiCreators}</p>
          </div>
        </div>
      </div>

      <div className="premium-card hover:border-brand-yellow/50">
        <h2 className="text-xl font-bold mb-4 text-white flex items-center">
          <Activity className="h-5 w-5 mr-2 text-brand-yellow" />
          Recent Activities
          <span className="ml-2 inline-flex items-center relative">
            <span className={`${styles['radar-ping']} absolute`}></span>
          </span>
        </h2>
        <RecentActivities activities={recentActivities} />
      </div>
    </div>
  );
};

export default Dashboard;
