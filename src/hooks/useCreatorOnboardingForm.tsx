
// This file now just re-exports the refactored hook for backward compatibility
import { useCreatorOnboarding } from "./creator-onboarding/useCreatorOnboarding";

export { useCreatorOnboarding as useCreatorOnboardingForm };
export type { ValidationErrors, CustomSocialLink } from "./creator-onboarding/types";
