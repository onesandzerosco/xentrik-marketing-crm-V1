export interface Creator {
  id: string;
  name: string;
  email: string;
  profileImage: string;
  gender: string;
  team: string;
  creatorType: string;
  socialLinks: {
    instagram: string;
    tiktok: string;
    twitter: string;
    reddit: string;
    chaturbate: string;
  };
}

export type TimeFilter = "yesterday" | "today" | "week" | "month" | "custom";
