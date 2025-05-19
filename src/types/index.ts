
export interface Creator {
  id: string;
  name: string;
  email: string;
  profileImage: string;
  gender: Gender;
  team: Team;
  creatorType: CreatorType;
  socialLinks: {
    instagram: string;
    tiktok: string;
    twitter: string;
    reddit: string;
    chaturbate: string;
    youtube?: string;
  };
  tags?: string[];
  assignedTeamMembers?: any[];
  needsReview?: boolean;
  active?: boolean;
  telegramUsername?: string;
  whatsappNumber?: string;
  notes?: string;
}

export type Gender = "Male" | "Female" | "Trans";
export type Team = "A Team" | "B Team" | "C Team";
export type CreatorType = "Real" | "AI";
export type TimeFilter = "yesterday" | "today" | "week" | "month" | "custom";

export interface EngagementStats {
  instagram: { followers: number; engagement?: number; trend: number };
  tiktok: { views: number; followers?: number; trend: number };
  twitter: { impressions: number; followers?: number; trend: number };
  reddit: { upvotes: number; subscribers?: number; trend: number };
  chaturbate: { viewers: number; followers?: number; trend: number };
}

// Income related types
export interface IncomeStats {
  subscriptions: number[];
  tips: number[];
  posts: number[];
  messages: number[];
  referrals: number[];
  streams: number[];
  dates: string[];
}

export interface IncomeSource {
  name: string;
  value: number;
  color: string;
  increase: number;
}
