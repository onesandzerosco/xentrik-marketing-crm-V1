
import { Gender, Team, CreatorType } from "@/types";
import { Employee } from "@/types/employee";
import { CustomSocialLink } from "@/components/onboarding/social/CustomSocialLinkItem";

export interface CreatorProfileState {
  name: string;
  nameError: string | null;
  gender: Gender;
  team: Team;
  creatorType: CreatorType;
  profileImage: string;
  telegramUsername: string;
  whatsappNumber: string;
  instagram: string;
  tiktok: string;
  twitter: string;
  reddit: string;
  chaturbate: string;
  youtube: string;
  customSocialLinks: CustomSocialLink[];
  notes: string;
  needsReview: boolean;
  assignedMembers: Employee[];
  marketingStrategy: string; // Change to text field instead of platform booleans
  errors: Record<string, string>;
}

export interface CreatorProfileActions {
  setName: (name: string) => void;
  setNameError: (error: string | null) => void;
  setGender: (gender: Gender) => void;
  setTeam: (team: Team) => void;
  setCreatorType: (type: CreatorType) => void;
  setProfileImage: (image: string) => void;
  setTelegramUsername: (username: string) => void;
  setWhatsappNumber: (number: string) => void;
  setInstagram: (url: string) => void;
  setTiktok: (url: string) => void;
  setTwitter: (url: string) => void;
  setReddit: (url: string) => void;
  setChaturbate: (url: string) => void;
  setYoutube: (url: string) => void;
  setCustomSocialLinks: (links: CustomSocialLink[]) => void;
  setNotes: (notes: string) => void;
  setNeedsReview: (needsReview: boolean) => void;
  setAssignedMembers: (members: Employee[]) => void;
  setMarketingStrategy: (strategy: string) => void; // Change to text field
}
