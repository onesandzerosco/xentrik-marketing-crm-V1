
import { Creator, EngagementStats } from "../../types";

// Mock data for initial creators
export const initialCreators: Creator[] = [
  {
    id: "1",
    name: "Oliver",
    profileImage: "/avatar1.png",
    gender: "Male",
    team: "A Team",
    creatorType: "Real",
    socialLinks: {
      instagram: "https://instagram.com",
      twitter: "https://twitter.com",
      reddit: "https://reddit.com",
    },
    tags: ["Male", "A Team"],
    needsReview: true,
  },
  {
    id: "2",
    name: "Janas",
    profileImage: "/avatar2.png",
    gender: "Female",
    team: "B Team",
    creatorType: "Real",
    socialLinks: {
      instagram: "https://instagram.com",
      tiktok: "https://tiktok.com",
      twitter: "https://twitter.com",
    },
    tags: ["Female", "B Team"],
    needsReview: false,
  },
  {
    id: "3",
    name: "Frans",
    profileImage: "/avatar3.png",
    gender: "Trans",
    team: "C Team",
    creatorType: "Real",
    socialLinks: {
      instagram: "https://instagram.com",
      twitter: "https://twitter.com",
    },
    tags: ["Trans", "C Team"],
  },
  {
    id: "4",
    name: "Jorelan",
    profileImage: "/avatar4.png",
    gender: "Female",
    team: "B Team",
    creatorType: "AI",
    socialLinks: {
      instagram: "https://instagram.com",
      tiktok: "https://tiktok.com",
      twitter: "https://twitter.com",
    },
    tags: ["AI", "B Team"],
  },
  {
    id: "5",
    name: "Fremay",
    profileImage: "/avatar5.png",
    gender: "Male",
    team: "A Team",
    creatorType: "AI",
    socialLinks: {
      instagram: "https://instagram.com",
      twitter: "https://twitter.com",
    },
    tags: ["AI", "A Team"],
  },
  {
    id: "6",
    name: "Tremt",
    profileImage: "/avatar6.png",
    gender: "Male",
    team: "A Team",
    creatorType: "AI",
    socialLinks: {
      instagram: "https://instagram.com",
      tiktok: "https://tiktok.com",
      twitter: "https://twitter.com",
    },
    tags: ["AI", "A Team"],
  },
];

// Mock engagement stats
export const mockEngagementStats: Record<string, EngagementStats> = {
  "1": {
    instagram: { followers: 15000, engagement: 8.5, trend: 2.3 },
    tiktok: { views: 250000, followers: 10000, trend: 5.7 },
    twitter: { impressions: 50000, followers: 5000, trend: -1.2 },
    reddit: { upvotes: 3000, subscribers: 2000, trend: 10.5 },
    chaturbate: { viewers: 5000, followers: 2000, trend: 3.8 },
  },
  "2": {
    instagram: { followers: 25000, engagement: 10.2, trend: 1.5 },
    tiktok: { views: 500000, followers: 30000, trend: 8.3 },
    twitter: { impressions: 30000, followers: 8000, trend: 4.1 },
    reddit: { upvotes: 5000, subscribers: 3500, trend: 2.0 },
    chaturbate: { viewers: 8000, followers: 4000, trend: 6.7 },
  },
  "3": {
    instagram: { followers: 8000, engagement: 7.8, trend: -2.5 },
    tiktok: { views: 120000, followers: 15000, trend: 3.2 },
    twitter: { impressions: 25000, followers: 3000, trend: 1.8 },
    reddit: { upvotes: 1500, subscribers: 800, trend: -5.3 },
    chaturbate: { viewers: 3000, followers: 1500, trend: -1.2 },
  },
  "4": {
    instagram: { followers: 18000, engagement: 9.2, trend: 3.6 },
    tiktok: { views: 300000, followers: 25000, trend: 4.5 },
    twitter: { impressions: 40000, followers: 7000, trend: 2.8 },
    reddit: { upvotes: 4000, subscribers: 2500, trend: 6.3 },
    chaturbate: { viewers: 6000, followers: 3000, trend: 4.2 },
  },
  "5": {
    instagram: { followers: 30000, engagement: 12.5, trend: 8.7 },
    tiktok: { views: 600000, followers: 40000, trend: 10.2 },
    twitter: { impressions: 60000, followers: 12000, trend: 7.9 },
    reddit: { upvotes: 8000, subscribers: 5000, trend: 9.1 },
    chaturbate: { viewers: 10000, followers: 6000, trend: 8.4 },
  },
  "6": {
    instagram: { followers: 12000, engagement: 8.0, trend: 1.0 },
    tiktok: { views: 200000, followers: 18000, trend: 2.5 },
    twitter: { impressions: 35000, followers: 6000, trend: 3.0 },
    reddit: { upvotes: 2500, subscribers: 1500, trend: 1.8 },
    chaturbate: { viewers: 4000, followers: 2500, trend: 2.2 },
  },
};
