
import React from "react";
import { useCreators } from "../context/CreatorContext";
import Sidebar from "../components/Sidebar";

const Dashboard = () => {
  const { creators } = useCreators();

  // Calculate totals for the dashboard
  const totalCreators = creators.length;
  const teamA = creators.filter(c => c.team === "A Team").length;
  const teamB = creators.filter(c => c.team === "B Team").length;
  const teamC = creators.filter(c => c.team === "C Team").length;
  
  const maleCreators = creators.filter(c => c.gender === "Male").length;
  const femaleCreators = creators.filter(c => c.gender === "Female").length;
  const transCreators = creators.filter(c => c.gender === "Trans").length;
  const aiCreators = creators.filter(c => c.creatorType === "AI").length;

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-60 p-8 w-full">
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

        <div className="bg-card rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center p-3 border border-border rounded-lg">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-3"></div>
              <p className="text-sm">New creator onboarded: <span className="font-medium">Oliver</span></p>
              <span className="ml-auto text-xs text-muted-foreground">1 hour ago</span>
            </div>
            <div className="flex items-center p-3 border border-border rounded-lg">
              <div className="h-2 w-2 rounded-full bg-yellow-500 mr-3"></div>
              <p className="text-sm">Profile updated for: <span className="font-medium">Janas</span></p>
              <span className="ml-auto text-xs text-muted-foreground">3 hours ago</span>
            </div>
            <div className="flex items-center p-3 border border-border rounded-lg">
              <div className="h-2 w-2 rounded-full bg-red-500 mr-3"></div>
              <p className="text-sm">Engagement drop alert for: <span className="font-medium">Frans</span></p>
              <span className="ml-auto text-xs text-muted-foreground">1 day ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
