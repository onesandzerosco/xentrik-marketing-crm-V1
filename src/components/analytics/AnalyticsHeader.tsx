
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";

interface AnalyticsHeaderProps {
  creatorId: string;
  creatorName: string;
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({ creatorId, creatorName }) => {
  return (
    <div className="flex items-center mb-6">
      <Link to={`/creators/${creatorId}`} className="mr-4">
        <Button variant="outline" size="icon">
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </Link>
      <div>
        <h1 className="text-3xl font-bold">{creatorName}'s Analytics</h1>
        <p className="text-muted-foreground">Performance metrics across platforms</p>
      </div>
      <Button className="ml-auto" variant="outline">
        <Download className="h-4 w-4 mr-2" />
        Download Report
      </Button>
    </div>
  );
};
