import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface MarketingStrategyProps {
  marketingStrategy: {
    reddit: boolean;
    twitter: boolean;
    tiktok: boolean;
    instagram: boolean;
    chaturbate: boolean;
  };
  setMarketingStrategy: (strategy: {
    reddit: boolean;
    twitter: boolean;
    tiktok: boolean;
    instagram: boolean;
    chaturbate: boolean;
  }) => void;
}

const MarketingStrategySection: React.FC<MarketingStrategyProps> = ({
  marketingStrategy,
  setMarketingStrategy,
}) => {
  const handleCheckboxChange = (platform: keyof typeof marketingStrategy, checked: boolean) => {
    setMarketingStrategy({
      ...marketingStrategy,
      [platform]: checked,
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Marketing Strategy</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="reddit"
            checked={marketingStrategy.reddit}
            onCheckedChange={(checked) => handleCheckboxChange('reddit', checked as boolean)}
          />
          <Label htmlFor="reddit" className="text-sm font-medium">
            Reddit
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="twitter"
            checked={marketingStrategy.twitter}
            onCheckedChange={(checked) => handleCheckboxChange('twitter', checked as boolean)}
          />
          <Label htmlFor="twitter" className="text-sm font-medium">
            Twitter / X
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="tiktok"
            checked={marketingStrategy.tiktok}
            onCheckedChange={(checked) => handleCheckboxChange('tiktok', checked as boolean)}
          />
          <Label htmlFor="tiktok" className="text-sm font-medium">
            TikTok
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="instagram"
            checked={marketingStrategy.instagram}
            onCheckedChange={(checked) => handleCheckboxChange('instagram', checked as boolean)}
          />
          <Label htmlFor="instagram" className="text-sm font-medium">
            Instagram
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="chaturbate"
            checked={marketingStrategy.chaturbate}
            onCheckedChange={(checked) => handleCheckboxChange('chaturbate', checked as boolean)}
          />
          <Label htmlFor="chaturbate" className="text-sm font-medium">
            Chaturbate
          </Label>
        </div>
      </div>
    </div>
  );
};

export default MarketingStrategySection;