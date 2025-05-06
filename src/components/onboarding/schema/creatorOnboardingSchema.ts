
import { z } from "zod";

// Define the onboarding schema
export const creatorOnboardingSchema = z.object({
  // Basic Info
  name: z.string().min(1, "Name is required"),
  gender: z.enum(["Male", "Female", "Trans", "AI"], {
    required_error: "Please select a gender",
  }),
  email: z.string().email("Please enter a valid email address"),
  bio: z.string().optional(),
  
  // Contact Info
  telegramUsername: z.string().optional(),
  whatsappNumber: z.string().optional(),
  
  // Social Media
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
  twitter: z.string().optional(),
  reddit: z.string().optional(),
  youtube: z.string().optional(),
  
  // Custom Social Links (can be extended)
  customSocialLinks: z.array(
    z.object({
      platform: z.string().min(1, "Platform name is required"),
      url: z.string().url("Please enter a valid URL"),
    })
  ).optional(),
  
  // Profile Picture
  profilePicture: z.any().optional(),
  
  // Additional Information
  notes: z.string().optional(),
  
  // Consent
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms to continue",
  }),
});

export type CreatorOnboardingFormValues = z.infer<typeof creatorOnboardingSchema>;

// Default values for the form
export const defaultCreatorOnboardingValues: Partial<CreatorOnboardingFormValues> = {
  gender: "Female",
  customSocialLinks: [],
  termsAccepted: false,
};
