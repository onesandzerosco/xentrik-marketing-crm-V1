
export interface SocialMediaLogin {
  id: string;
  creator_email: string;
  platform: string;
  username: string;
  password: string;
  notes: string;
  is_predefined: boolean;
  created_at: string;
  updated_at: string;
}

export interface OnboardingSubmissionData {
  personalInfo?: any;
  physicalAttributes?: any;
  personalPreferences?: any;
  contentAndService?: {
    socialMediaHandles?: {
      instagram?: string;
      twitter?: string;
      tiktok?: string;
      onlyfans?: string;
      snapchat?: string;
      other?: Array<{
        platform: string;
        handle: string;
      }>;
    };
    [key: string]: any;
  };
  [key: string]: any;
}
