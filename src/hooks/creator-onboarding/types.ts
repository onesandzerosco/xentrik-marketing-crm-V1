
import { Gender, Team, CreatorType } from "@/types";

export interface CustomSocialLink {
  id: string;
  name: string;
  url: string;
}

export interface ValidationErrors {
  name?: string;
  gender?: string;
  team?: string;
  creatorType?: string;
  telegramUsername?: string;
  whatsappNumber?: string;
  contactRequired?: string;
  instagram?: string;
  tiktok?: string;
  twitter?: string;
  reddit?: string;
  chaturbate?: string;
  youtube?: string;
  customSocialLinks?: string[];
}

export interface FormState {
  name: string;
  profileImage: string;
  gender: Gender;
  team: Team;
  creatorType: CreatorType;
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
  marketingStrategy: string[];
  errors: ValidationErrors;
}

export interface FormActions {
  setName: (name: string) => void;
  setProfileImage: (image: string) => void;
  setGender: (gender: Gender) => void;
  setTeam: (team: Team) => void;
  setCreatorType: (type: CreatorType) => void;
  setTelegramUsername: (username: string) => void;
  setWhatsappNumber: (number: string) => void;
  setInstagram: (username: string) => void;
  setTiktok: (username: string) => void;
  setTwitter: (username: string) => void;
  setReddit: (username: string) => void;
  setChaturbate: (username: string) => void;
  setYoutube: (username: string) => void;
  setCustomSocialLinks: (links: CustomSocialLink[]) => void;
  setNotes: (notes: string) => void;
  setMarketingStrategy: (strategy: string[]) => void;
}
