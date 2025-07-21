import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface MarketingStrategyProps {
  marketingStrategy: string;
  setMarketingStrategy: (strategy: string) => void;
}

const MarketingStrategySection: React.FC<MarketingStrategyProps> = ({
  marketingStrategy,
  setMarketingStrategy,
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Marketing Strategy</h2>
      <div className="space-y-2">
        <Label htmlFor="marketingStrategy" className="text-sm font-medium">
          Describe the marketing strategy for this creator
        </Label>
        <Textarea
          id="marketingStrategy"
          value={marketingStrategy}
          onChange={(e) => setMarketingStrategy(e.target.value)}
          placeholder="Enter the marketing strategy details, approach, target audience, key platforms, content themes, etc..."
          rows={4}
          className="resize-none"
        />
      </div>
    </div>
  );
};

export default MarketingStrategySection;