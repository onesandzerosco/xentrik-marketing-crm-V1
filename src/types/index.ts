
export type Team = "A Team" | "B Team" | "C Team";
export type Gender = "Male" | "Female" | "Trans" | "AI";

export interface Creator {
  id: string;
  name: string;
  profileImage: string;
  gender: Gender;
  team: Team;
  socialLinks: {
    instagram?: string;
    tiktok?: string;
    twitter?: string;
    reddit?: string;
    chaturbate?: string;
  };
  tags: string[];
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
