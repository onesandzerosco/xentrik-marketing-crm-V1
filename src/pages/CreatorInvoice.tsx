
import React from "react";
import { useParams } from "react-router-dom";
import { useCreators } from "../context/creator"; 
import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader";
import { CreatorInvoice as CreatorInvoiceComponent } from "@/components/analytics/income/CreatorInvoice";

const CreatorInvoice = () => {
  const { id } = useParams<{ id: string }>();
  const { getCreator } = useCreators();
  
  const creator = getCreator(id || "");
  
  if (!creator) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <p>Creator not found.</p>
      </div>
    );
  }

  return (
    <div className="p-8 w-full max-w-[calc(100vw-240px)] min-h-screen bg-background">
      <AnalyticsHeader creatorId={id || ""} creatorName={creator.name} />
      
      <div className="mt-6">
        <CreatorInvoiceComponent creatorId={id || ""} creatorName={creator.name} />
      </div>
    </div>
  );
};

export default CreatorInvoice;
