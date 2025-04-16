
import { ValidationErrors } from "./types";

export function useValidation() {
  const validateForm = (
    name: string, 
    telegramUsername: string, 
    whatsappNumber: string
  ): { isValid: boolean; errors: ValidationErrors } => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    // Basic validation
    if (!name.trim()) {
      newErrors.name = "Creator name is required";
      isValid = false;
    }

    // At least one contact method is required
    if (!telegramUsername.trim() && !whatsappNumber.trim()) {
      newErrors.contactRequired = "At least one contact method is required";
      isValid = false;
    }

    // Format validation
    if (telegramUsername && telegramUsername.trim() !== '') {
      if (!telegramUsername.startsWith('@') || telegramUsername === '@') {
        newErrors.telegramUsername = "Telegram username should start with @";
        isValid = false;
      }
    }

    return { isValid, errors: newErrors };
  };

  return {
    validateForm
  };
}
