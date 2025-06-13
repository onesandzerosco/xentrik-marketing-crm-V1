
import React from "react";
import { Card } from "@/components/ui/card";
import { MultiStepForm } from "@/components/onboarding/multi-step/MultiStepForm";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ContentGuideDownloader from "@/components/onboarding/ContentGuideDownloader";

const CreatorOnboardForm: React.FC = () => {
  const { token } = useParams();
  
  return (
    <div className="p-8 w-full bg-premium-dark min-h-screen">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-white">Creator Onboarding</h1>
          <ContentGuideDownloader className="text-white" />
        </div>
        <p className="text-muted-foreground">
          {token ? "Complete your creator onboarding using the invitation link." : "Join our platform as a creator by filling out this form."}
        </p>
      </div>
      
      <div className="max-w-5xl mx-auto">
        <MultiStepForm token={token} />
      </div>
    </div>
  );
};

export default CreatorOnboardForm;
