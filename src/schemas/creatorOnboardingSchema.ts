
import { z } from "zod";

export const personalInfoSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  modelName: z.string().min(1, "Model name is required"),
  nickname: z.string().optional().or(z.literal('')),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  dateOfBirth: z.string().optional().or(z.literal('')),
  age: z.number().optional().nullable(),
  sex: z.enum(["Female", "Male", "Transgender"]).optional(),
  location: z.string().optional().or(z.literal('')),
  additionalLocationNote: z.string().optional().or(z.literal('')),
  hometown: z.string().optional().or(z.literal('')),
  ethnicity: z.string().optional().or(z.literal('')),
  religion: z.string().optional().or(z.literal('')),
  relationshipStatus: z.string().optional().or(z.literal('')),
  handedness: z.enum(["Left", "Right", "Ambidextrous"]).optional(),
  hasPets: z.boolean().default(false),
  pets: z.array(
    z.object({
      type: z.string().optional().or(z.literal('')),
      breed: z.string().optional().or(z.literal('')),
      age: z.string().optional().or(z.literal('')),
      name: z.string().optional().or(z.literal('')),
    })
  ).optional(),
  hasKids: z.boolean().default(false),
  numberOfKids: z.number().optional().nullable(),
  occupation: z.string().optional().or(z.literal('')),
  workplace: z.string().optional().or(z.literal('')),
  placesVisited: z.string().optional().or(z.literal('')),
  preferredFanNickname: z.string().optional().or(z.literal('')),
});

export const physicalAttributesSchema = z.object({
  weight: z.string().optional().or(z.literal('')),
  height: z.string().optional().or(z.literal('')),
  bodyType: z.string().optional().or(z.literal('')),
  favoriteColor: z.string().optional().or(z.literal('')),
  dislikedColor: z.string().optional().or(z.literal('')),
  allergies: z.string().optional().or(z.literal('')),
  hasTattoos: z.boolean().default(false),
  tattooDetails: z.string().optional().or(z.literal('')),
  bustWaistHip: z.string().optional().or(z.literal('')),
  dickSize: z.string().optional().or(z.literal('')),
  isCircumcised: z.boolean().optional(),
  isTopOrBottom: z.enum(["Top", "Bottom", "Versatile"]).optional(),
});

export const personalPreferencesSchema = z.object({
  hobbies: z.array(z.string()).optional(),
  favoriteDrink: z.string().optional().or(z.literal('')),
  canSing: z.boolean().default(false),
  smokes: z.boolean().default(false),
  drinks: z.boolean().default(false),
  isSexual: z.boolean().default(false),
  homeActivities: z.string().optional().or(z.literal('')),
  morningRoutine: z.string().optional().or(z.literal('')),
  likeInPerson: z.string().optional().or(z.literal('')),
  dislikeInPerson: z.string().optional().or(z.literal('')),
  turnOffs: z.string().optional().or(z.literal('')),
  favoriteExpression: z.string().optional().or(z.literal('')),
});

export const contentAndServiceSchema = z.object({
  bodyCount: z.number().optional().nullable(),
  hasFetish: z.boolean().default(false),
  fetishDetails: z.string().optional().or(z.literal('')),
  doesAnal: z.boolean().default(false),
  hasTriedOrgy: z.boolean().default(false),
  sexToysCount: z.string().optional().or(z.literal('')),
  lovesThreesomes: z.boolean().default(false),
  favoritePosition: z.string().optional().or(z.literal('')),
  craziestSexPlace: z.string().optional().or(z.literal('')),
  fanHandlingPreference: z.string().optional().or(z.literal('')),
  pricePerMinute: z.number().optional().nullable(),
  customVideoNotes: z.string().optional().or(z.literal('')),
  videoCallPrice: z.number().optional().nullable(),
  videoCallNotes: z.string().optional().or(z.literal('')),
  sellsUnderwear: z.boolean().default(false),
  dickRatePrice: z.number().optional().nullable(),
  dickRateNotes: z.string().optional().or(z.literal('')),
  underwearSellingPrice: z.number().optional().nullable(),
  underwearSellingNotes: z.string().optional().or(z.literal('')),
  socialMediaHandles: z.object({
    instagram: z.string().optional().or(z.literal('')),
    twitter: z.string().optional().or(z.literal('')),
    tiktok: z.string().optional().or(z.literal('')),
    onlyfans: z.string().optional().or(z.literal('')),
    snapchat: z.string().optional().or(z.literal('')),
    other: z.array(
      z.object({
        platform: z.string(),
        handle: z.string(),
      })
    ).optional(),
  }).optional(),
});

export const creatorOnboardingSchema = z.object({
  personalInfo: personalInfoSchema,
  physicalAttributes: physicalAttributesSchema,
  personalPreferences: personalPreferencesSchema,
  contentAndService: contentAndServiceSchema,
});

export type CreatorOnboardingFormValues = z.infer<typeof creatorOnboardingSchema>;
export type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;
export type PhysicalAttributesFormValues = z.infer<typeof physicalAttributesSchema>;
export type PersonalPreferencesFormValues = z.infer<typeof personalPreferencesSchema>;
export type ContentAndServiceFormValues = z.infer<typeof contentAndServiceSchema>;

export const defaultPersonalInfoValues: PersonalInfoFormValues = {
  fullName: "",
  modelName: "",
  nickname: "",
  email: "",
  dateOfBirth: "",
  age: undefined,
  sex: undefined,
  location: "",
  additionalLocationNote: "",
  hometown: "",
  ethnicity: "",
  religion: "",
  relationshipStatus: "",
  handedness: undefined,
  hasPets: false,
  pets: [],
  hasKids: false,
  numberOfKids: undefined,
  occupation: "",
  workplace: "",
  placesVisited: "",
  preferredFanNickname: "",
};

export const defaultPhysicalAttributesValues: PhysicalAttributesFormValues = {
  weight: "",
  height: "",
  bodyType: "",
  favoriteColor: "",
  dislikedColor: "",
  allergies: "",
  hasTattoos: false,
  tattooDetails: "",
  bustWaistHip: "",
  dickSize: "",
  isCircumcised: undefined,
  isTopOrBottom: undefined,
};

export const defaultPersonalPreferencesValues: PersonalPreferencesFormValues = {
  hobbies: [],
  favoriteDrink: "",
  canSing: false,
  smokes: false,
  drinks: false,
  isSexual: false,
  homeActivities: "",
  morningRoutine: "",
  likeInPerson: "",
  dislikeInPerson: "",
  turnOffs: "",
  favoriteExpression: "",
};

export const defaultContentAndServiceValues: ContentAndServiceFormValues = {
  bodyCount: undefined,
  hasFetish: false,
  fetishDetails: "",
  doesAnal: false,
  hasTriedOrgy: false,
  sexToysCount: "",
  lovesThreesomes: false,
  favoritePosition: "",
  craziestSexPlace: "",
  fanHandlingPreference: "",
  pricePerMinute: undefined,
  customVideoNotes: "",
  videoCallPrice: undefined,
  videoCallNotes: "",
  sellsUnderwear: false,
  dickRatePrice: undefined,
  dickRateNotes: "",
  underwearSellingPrice: undefined,
  underwearSellingNotes: "",
  socialMediaHandles: {
    instagram: "",
    twitter: "",
    tiktok: "",
    onlyfans: "",
    snapchat: "",
    other: [],
  },
};

export const defaultOnboardingValues: CreatorOnboardingFormValues = {
  personalInfo: defaultPersonalInfoValues,
  physicalAttributes: defaultPhysicalAttributesValues,
  personalPreferences: defaultPersonalPreferencesValues,
  contentAndService: defaultContentAndServiceValues,
};
