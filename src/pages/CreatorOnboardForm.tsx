
import React from "react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { MultiStepForm } from "@/components/onboarding/multi-step/MultiStepForm";

const CreatorOnboardForm: React.FC = () => {
  const { user, userRole } = useAuth();
  
  // Only allow admins to access this page
  if (userRole !== "Admin") {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <div className="p-8 w-full bg-premium-dark">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-white">Admin Creator Onboarding</h1>
        <p className="text-muted-foreground">Use this form to directly onboard a new creator to the system (Admin only).</p>
      </div>
      
      <div className="max-w-5xl mx-auto">
        <MultiStepForm />
      </div>
    </div>
  );
};

export default CreatorOnboardForm;
