import { z } from "zod";

export const personalInfoSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  nickname: z.string().optional(),
  email: z.string().email("Invalid email address").optional(),
  dateOfBirth: z.string().optional(),
  age: z.number().optional(),
  sex: z.enum(["Female", "Male", "Transgender", "Prefer not to say"]).optional(),
  location: z.string().optional(),
  ethnicity: z.string().optional(),
  religion: z.string().optional(),
  relationshipStatus: z.string().optional(),
  handedness: z.enum(["Left", "Right", "Ambidextrous"]).optional(),
  hasPets: z.boolean().default(false),
  pets: z.array(
    z.object({
      type: z.string().optional(),
      breed: z.string().optional(),
      age: z.string().optional(),
      name: z.string().optional(),
    })
  ).optional(),
  hasKids: z.boolean().default(false),
  numberOfKids: z.number().optional(),
  occupation: z.string().optional(),
  workplace: z.string().optional(),
  placesVisited: z.array(z.string()).optional(),
});

export const physicalAttributesSchema = z.object({
  weight: z.string().optional(),
  height: z.string().optional(),
  bodyType: z.string().optional(),
  favoriteColor: z.string().optional(),
  dislikedColor: z.string().optional(),
  allergies: z.string().optional(),
  hasTattoos: z.boolean().default(false),
  tattooDetails: z.string().optional(),
  bustWaistHip: z.string().optional(),
  dickSize: z.string().optional(),
  isCircumcised: z.boolean().optional(),
  isTopOrBottom: z.enum(["Top", "Bottom", "Versatile"]).optional(),
});

export const personalPreferencesSchema = z.object({
  hobbies: z.array(z.string()).optional(),
  favoriteDrink: z.string().optional(),
  canSing: z.boolean().default(false),
  smokes: z.boolean().default(false),
  drinks: z.boolean().default(false),
  isSexual: z.boolean().default(false),
  homeActivities: z.string().optional(),
  morningRoutine: z.string().optional(),
  likeInPerson: z.string().optional(),
  dislikeInPerson: z.string().optional(),
  turnOffs: z.string().optional(),
  favoriteExpression: z.string().optional(),
});

export const contentAndServiceSchema = z.object({
  bodyCount: z.number().optional(),
  hasFetish: z.boolean().default(false),
  fetishDetails: z.string().optional(),
  doesAnal: z.boolean().default(false),
  hasTriedOrgy: z.boolean().default(false),
  sexToysCount: z.number().optional(),
  lovesThreesomes: z.boolean().default(false),
  favoritePosition: z.string().optional(),
  craziestSexPlace: z.string().optional(),
  fanHandlingPreference: z.string().optional(),
  pricePerMinute: z.number().optional(),
  videoCallPrice: z.number().optional(),
  sellsUnderwear: z.boolean().default(false),
  socialMediaHandles: z.object({
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    tiktok: z.string().optional(),
    onlyfans: z.string().optional(),
    snapchat: z.string().optional(),
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
  nickname: "",
  email: "",
  dateOfBirth: "",
  age: undefined,
  sex: undefined,
  location: "",
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
  placesVisited: [],
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
  sexToysCount: undefined,
  lovesThreesomes: false,
  favoritePosition: "",
  craziestSexPlace: "",
  fanHandlingPreference: "",
  pricePerMinute: undefined,
  videoCallPrice: undefined,
  sellsUnderwear: false,
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
