
import { z } from "zod";

// Define the onboarding schema
export const creatorOnboardingSchema = z.object({
  // Basic Info
  name: z.string().min(1, "Name is required"),
  gender: z.enum(["Male", "Female", "Trans", "AI"], {
    required_error: "Please select a gender",
  }),
  email: z.string().email("Please enter a valid email address"),
  bio: z.string().min(1, "Bio is required"),
  
  // Contact Info
  telegramUsername: z.string().min(1, "Telegram username is required"),
  whatsappNumber: z.string().min(1, "WhatsApp number is required"),
  
  // Social Media
  instagram: z.string().min(1, "Instagram is required"),
  tiktok: z.string().min(1, "TikTok is required"),
  twitter: z.string().min(1, "Twitter is required"),
  reddit: z.string().min(1, "Reddit is required"),
  youtube: z.string().min(1, "YouTube is required"),
  
  // Custom Social Links (can be extended)
  customSocialLinks: z.array(
    z.object({
      platform: z.string().min(1, "Platform name is required"),
      url: z.string().url("Please enter a valid URL"),
    })
  ).min(1, "At least one custom social link is required"),
  
  // Profile Picture
  profilePicture: z.any().refine(val => val !== undefined && val !== null, {
    message: "Profile picture is required",
  }),
  
  // Additional Information
  notes: z.string().min(1, "Notes are required"),
  
  // Consent
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms to continue",
  }),
});

export type CreatorOnboardingFormValues = z.infer<typeof creatorOnboardingSchema>;

// Default values for the form
export const defaultCreatorOnboardingValues: Partial<CreatorOnboardingFormValues> = {
  name: "",
  gender: "Female",
  email: "",
  bio: "",
  telegramUsername: "",
  whatsappNumber: "",
  instagram: "",
  tiktok: "",
  twitter: "",
  reddit: "",
  youtube: "",
  customSocialLinks: [{ platform: "", url: "" }],
  notes: "",
  termsAccepted: false,
};
