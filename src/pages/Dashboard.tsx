
import React from "react";
import { useCreators } from "../context/CreatorContext";
import { useActivities } from "../context/ActivityContext";
import RecentActivities from "../components/dashboard/RecentActivities";

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

  // Get recent activities
  const recentActivities = getRecentActivities(3); // Show 3 most recent activities

  return (
    <div className="p-8 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your creator management system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-medium mb-2">Total Creators</h3>
          <p className="text-4xl font-bold">{totalCreators}</p>
        </div>
        
        <div className="bg-card rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-medium mb-2">A Team</h3>
          <p className="text-4xl font-bold">{teamA}</p>
        </div>
        
        <div className="bg-card rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-medium mb-2">B Team</h3>
          <p className="text-4xl font-bold">{teamB}</p>
        </div>
        
        <div className="bg-card rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-medium mb-2">C Team</h3>
          <p className="text-4xl font-bold">{teamC}</p>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm mb-8">
        <h2 className="text-xl font-bold mb-4">Creator Distribution</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Male</h3>
            <p className="text-2xl font-bold">{maleCreators}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Female</h3>
            <p className="text-2xl font-bold">{femaleCreators}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Trans</h3>
            <p className="text-2xl font-bold">{transCreators}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">AI</h3>
            <p className="text-2xl font-bold">{aiCreators}</p>
          </div>
        </div>
      </div>

      <RecentActivities activities={recentActivities} />
    </div>
  );
};

export default Dashboard;
