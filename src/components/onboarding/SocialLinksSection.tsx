
import React from "react";
import PredefinedSocialLinks from "./social/PredefinedSocialLinks";
import CustomSocialLinksSection from "./social/CustomSocialLinksSection";
import AddSocialLinkForm from "./social/AddSocialLinkForm";
import AddCustomLinkButton from "./social/AddCustomLinkButton";
import { CustomSocialLink } from "./social/CustomSocialLinkItem";
import { useSocialLinksHandlers } from "./social/useSocialLinksHandlers";

interface SocialLinksSectionProps {
  instagram: string;
  setInstagram: (url: string) => void;
  tiktok: string;
  setTiktok: (url: string) => void;
  twitter: string;
  setTwitter: (url: string) => void;
  reddit: string;
  setReddit: (url: string) => void;
  chaturbate: string;
  setChaturbate: (url: string) => void;
  youtube: string;
  setYoutube: (url: string) => void;
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

const SocialLinksSection: React.FC<SocialLinksSectionProps> = (props) => {
  const {
    showAddForm,
    setShowAddForm,
    handleUpdateLink,
    handleRemoveLink,
    handleAddLink
  } = useSocialLinksHandlers(props.customSocialLinks, props.setCustomSocialLinks);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Social Media Links</h2>
      
      <PredefinedSocialLinks
        instagram={props.instagram}
        setInstagram={props.setInstagram}
        tiktok={props.tiktok}
        setTiktok={props.setTiktok}
        twitter={props.twitter}
        setTwitter={props.setTwitter}
        reddit={props.reddit}
        setReddit={props.setReddit}
        chaturbate={props.chaturbate}
        setChaturbate={props.setChaturbate}
        youtube={props.youtube}
        setYoutube={props.setYoutube}
        errors={props.errors}
      />
      
      <CustomSocialLinksSection
        customSocialLinks={props.customSocialLinks}
        onUpdateLink={handleUpdateLink}
        onRemoveLink={handleRemoveLink}
      />
      
      {showAddForm ? (
        <AddSocialLinkForm
          onAdd={handleAddLink}
          onCancel={() => setShowAddForm(false)}
        />
      ) : (
        <AddCustomLinkButton onClick={() => setShowAddForm(true)} />
      )}
    </div>
  );
};

export default SocialLinksSection;
