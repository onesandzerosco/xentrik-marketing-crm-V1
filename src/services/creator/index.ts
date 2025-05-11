
import { CreatorAddService } from "./CreatorAddService";
import { OnboardingService } from "./OnboardingService";
import { UserCreatorService } from "./UserCreatorService";
import { CreatorData } from "./types";

/**
 * Unified CreatorService that combines functionality from specialized services
 */
class CreatorService {
  /**
   * Add a new creator
   * @param creatorData The creator data to add
   * @returns The ID of the created creator or undefined on error
   */
  static async addCreator(creatorData: CreatorData): Promise<string | undefined> {
    return CreatorAddService.addCreator(creatorData);
  }
  
  /**
   * Save onboarding form data for a creator
   * @param token The onboarding token
   * @param formData The complete onboarding form data
   * @returns The creator ID or undefined on error
   */
  static async saveOnboardingData(token: string, formData: any): Promise<string | undefined> {
    return OnboardingService.saveOnboardingData(token, formData);
  }
  
  /**
   * Accept a creator onboarding submission
   * @param formData The onboarding form data 
   * @param creatorInfo The basic creator information to save
   * @returns The new creator ID or undefined on error
   */
  static async acceptOnboardingSubmission(
    formData: any, 
    creatorInfo: {
      name: string;
      team: "A" | "B" | "C";
      creatorType: "AI" | "Real";
    }
  ): Promise<string | undefined> {
    return OnboardingService.acceptOnboardingSubmission(formData, creatorInfo);
  }
  
  /**
   * Ensure a creator record exists for a user
   * Used when approving onboarding submissions
   * @param userId The user ID
   * @returns True if successful, false otherwise
   */
  static async ensureCreatorRecordExists(userId: string): Promise<boolean> {
    return UserCreatorService.ensureCreatorRecordExists(userId);
  }
}

export default CreatorService;
export { CreatorData };
