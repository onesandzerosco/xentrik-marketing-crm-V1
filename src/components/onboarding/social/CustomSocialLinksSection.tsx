
import React from "react";
import CustomSocialLinkItem, { CustomSocialLink } from "./CustomSocialLinkItem";

interface CustomSocialLinksSectionProps {
  customSocialLinks: CustomSocialLink[];
  onUpdateLink: (id: string, url: string) => void;
  onRemoveLink: (id: string) => void;
}

const CustomSocialLinksSection: React.FC<CustomSocialLinksSectionProps> = ({
  customSocialLinks,
  onUpdateLink,
  onRemoveLink
}) => {
  if (customSocialLinks.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Custom Social Links</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {customSocialLinks.map(link => (
          <CustomSocialLinkItem 
            key={link.id} 
            link={link} 
            onUpdate={onUpdateLink}
            onRemove={onRemoveLink}
          />
        ))}
      </div>
    </div>
  );
};

export default CustomSocialLinksSection;
