import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface MarketingStrategyProps {
  marketingStrategy: string[];
  setMarketingStrategy: (strategy: string[]) => void;
}

const MarketingStrategySection: React.FC<MarketingStrategyProps> = ({
  marketingStrategy,
  setMarketingStrategy,
}) => {
  const platforms = [
    { id: "Reddit", label: "Reddit" },
    { id: "Twitter", label: "Twitter / X" }, 
    { id: "TikTok", label: "TikTok" },
    { id: "Instagram", label: "Instagram" },
    { id: "Chaturbate", label: "Chaturbate" }
  ];

  const handleCheckboxChange = (platformId: string, checked: boolean) => {
    if (checked) {
      setMarketingStrategy([...marketingStrategy, platformId]);
    } else {
      setMarketingStrategy(marketingStrategy.filter(id => id !== platformId));
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Marketing Strategy</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {platforms.map((platform) => (
          <div key={platform.id} className="flex items-center space-x-2">
            <Checkbox
              id={platform.id}
              checked={marketingStrategy.includes(platform.id)}
              onCheckedChange={(checked) => handleCheckboxChange(platform.id, checked as boolean)}
            />
            <Label htmlFor={platform.id} className="text-sm font-medium">
              {platform.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketingStrategySection;