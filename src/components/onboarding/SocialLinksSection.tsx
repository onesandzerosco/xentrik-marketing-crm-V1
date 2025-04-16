
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PredefinedSocialLinks from "./social/PredefinedSocialLinks";
import CustomSocialLinksSection from "./social/CustomSocialLinksSection";
import AddSocialLinkForm from "./social/AddSocialLinkForm";
import { CustomSocialLink } from "./social/CustomSocialLinkItem";

interface SocialLinksSectionProps {
  instagram: string;
  setInstagram: (username: string) => void;
  tiktok: string;
  setTiktok: (username: string) => void;
  twitter: string;
  setTwitter: (username: string) => void;
  reddit: string;
  setReddit: (username: string) => void;
  chaturbate: string;
  setChaturbate: (username: string) => void;
  youtube: string;
  setYoutube: (username: string) => void;
  customSocialLinks: CustomSocialLink[];
  setCustomSocialLinks: (links: CustomSocialLink[]) => void;
  errors: {
    instagram?: string;
    tiktok?: string;
    twitter?: string;
    reddit?: string;
    chaturbate?: string;
    youtube?: string;
    customSocialLinks?: string[];
  };
}

const SocialLinksSection: React.FC<SocialLinksSectionProps> = ({
  instagram,
  setInstagram,
  tiktok,
  setTiktok,
  twitter,
  setTwitter,
  reddit,
  setReddit,
  chaturbate,
  setChaturbate,
  youtube,
  setYoutube,
  customSocialLinks,
  setCustomSocialLinks,
  errors = {}
}) => {
  const [showAddForm, setShowAddForm] = useState(false);

  const handleUpdateLink = (id: string, url: string) => {
    const updatedLinks = customSocialLinks.map(link => 
      link.id === id ? { ...link, url } : link
    );
    setCustomSocialLinks(updatedLinks);
  };

  const handleRemoveLink = (id: string) => {
    setCustomSocialLinks(customSocialLinks.filter(link => link.id !== id));
  };

  const handleAddLink = (newLink: CustomSocialLink) => {
    setCustomSocialLinks([...customSocialLinks, newLink]);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Social Media Links</h2>
      
      <PredefinedSocialLinks
        instagram={instagram}
        setInstagram={setInstagram}
        tiktok={tiktok}
        setTiktok={setTiktok}
        twitter={twitter}
        setTwitter={setTwitter}
        reddit={reddit}
        setReddit={setReddit}
        chaturbate={chaturbate}
        setChaturbate={setChaturbate}
        youtube={youtube}
        setYoutube={setYoutube}
        errors={errors}
      />
      
      <CustomSocialLinksSection
        customSocialLinks={customSocialLinks}
        onUpdateLink={handleUpdateLink}
        onRemoveLink={handleRemoveLink}
      />
      
      {showAddForm ? (
        <AddSocialLinkForm
          onAdd={handleAddLink}
          onCancel={() => setShowAddForm(false)}
        />
      ) : (
        <div className="mt-4">
          <Button 
            type="button" 
            variant="outline" 
            className="flex items-center"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Social Media
          </Button>
        </div>
      )}
    </div>
  );
};

export default SocialLinksSection;
