export type Team = "A Team" | "B Team" | "C Team";
export type Gender = "Male" | "Female" | "Trans";
export type CreatorType = "Real" | "AI";

export interface Creator {
  id: string;
  name: string;
  email?: string;
  profileImage: string;
  gender: Gender;
  team: Team;
  creatorType: CreatorType;
  socialLinks: {
    instagram?: string;
    tiktok?: string;
    twitter?: string;
    reddit?: string;
    chaturbate?: string;
    [key: string]: string | undefined;
  };
  tags: string[];
  needsReview?: boolean;
  assignedTeamMembers?: string[];
  telegramUsername?: string;
  whatsappNumber?: string;
  notes?: string;
}

export interface EngagementStats {
  instagram: {
    followers: number;
    engagement: number;
    trend: number;
  };
  tiktok: {
    views: number;
    followers: number;
    trend: number;
  };
  twitter: {
    impressions: number;
    followers: number;
    trend: number;
  };
  reddit: {
    upvotes: number;
    subscribers: number;
    trend: number;
  };
  chaturbate: {
    viewers: number;
    followers: number;
    trend: number;
  };
}

export interface User {
  username: string;
  password: string;
}

// Re-export activity types
export * from './activity';
