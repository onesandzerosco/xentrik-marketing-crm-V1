
export type Team = "A Team" | "B Team" | "C Team";
export type Gender = "Male" | "Female" | "Trans" | "AI";
export type CreatorType = "Real" | "AI";

export interface Creator {
  id: string;
  name: string;
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
  };
  tags: string[];
  needsReview?: boolean;
  assignedTeamMembers?: string[]; // IDs of team members assigned to this creator
  telegramUsername?: string; // Added for telegram integration
  whatsappNumber?: string; // Added for whatsapp integration
  notes?: string; // Additional notes about the creator
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
