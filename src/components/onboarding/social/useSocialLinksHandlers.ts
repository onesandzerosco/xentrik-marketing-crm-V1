
import { useState } from 'react';
import { CustomSocialLink } from './CustomSocialLinkItem';

export function useSocialLinksHandlers(
  customSocialLinks: CustomSocialLink[],
  setCustomSocialLinks: (links: CustomSocialLink[]) => void
) {
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

  return {
    showAddForm,
    setShowAddForm,
    handleUpdateLink,
    handleRemoveLink,
    handleAddLink
  };
}
