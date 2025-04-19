
import { ValidationErrors } from "./types";

export function useValidation() {
  const validateForm = (
    name: string,
    telegramUsername: string,
    whatsappNumber: string
  ): { isValid: boolean; errors: ValidationErrors } => {
    const errors: ValidationErrors = {};
    let isValid = true;

    console.log("Validating form with:", { name, telegramUsername, whatsappNumber });

    // Name validation
    if (!name || name.trim() === "") {
      errors.name = "Creator name is required";
      isValid = false;
    }

    // At least one contact method is required
    if ((!telegramUsername || telegramUsername.trim() === "") && 
        (!whatsappNumber || whatsappNumber.trim() === "")) {
      errors.contactRequired = "At least one contact method (Telegram or WhatsApp) is required";
      isValid = false;
    }

    // Telegram username validation (if provided)
    if (telegramUsername && telegramUsername.trim() !== "") {
      if (!telegramUsername.startsWith('@')) {
        errors.telegramUsername = "Telegram username must start with @";
        isValid = false;
      } else if (telegramUsername === '@') {
        errors.telegramUsername = "Please enter a valid username after @";
        isValid = false;
      }
    }

    // WhatsApp number validation (if provided)
    if (whatsappNumber && whatsappNumber.trim() !== "") {
      // Check for format like "+1 1234567890"
      const parts = whatsappNumber.split(' ');
      if (parts.length !== 2 || !parts[0].startsWith('+') || !/^\d+$/.test(parts[1])) {
        errors.whatsappNumber = "WhatsApp number should be in format: +XX XXXXXXXXXX";
        isValid = false;
      }
    }

    console.log("Validation result:", { isValid, errors });
    return { isValid, errors };
  };

  return { validateForm };
}
