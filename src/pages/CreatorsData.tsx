
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import CreatorsDataTable from "@/components/creators-data/CreatorsDataTable";

const CreatorsData: React.FC = () => {
  const { userRole, userRoles } = useAuth();
  
  // Allow admins, VAs, and chatters to access this page
  const allowedRoles = ["Admin", "VA", "Chatter"];
  const hasAccess = allowedRoles.includes(userRole) || 
                   (userRoles && userRoles.some(role => allowedRoles.includes(role)));
  
  if (!hasAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="p-8 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-white">Creators Data</h1>
        <p className="text-muted-foreground">
          View JSON data from all accepted creator onboarding submissions.
        </p>
      </div>
      
      <CreatorsDataTable />
    </div>
  );
};

export default CreatorsData;
