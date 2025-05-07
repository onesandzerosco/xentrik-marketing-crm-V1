
import { ValidationErrors } from "./types";

export function useValidation() {
  const validateForm = (
    name: string,
    telegramUsername: string,
    whatsappNumber: string
  ): { isValid: boolean; errors: ValidationErrors } => {
    const errors: ValidationErrors = {};
    let isValid = true;

    if (!name.trim()) {
      errors.name = "Creator name is required";
      isValid = false;
    }

    if (!telegramUsername.trim() && !whatsappNumber.trim()) {
      errors.contactRequired = "At least one contact method (Telegram or WhatsApp) is required";
      isValid = false;
    }

    if (telegramUsername && !telegramUsername.startsWith('@') && telegramUsername.trim() !== '') {
      errors.telegramUsername = "Telegram username should start with @ followed by your username";
      isValid = false;
    }

    if (whatsappNumber && whatsappNumber.trim() !== '') {
      const parts = whatsappNumber.split(' ');
      if (parts.length !== 2 || !parts[0].startsWith('+') || !/^\d+$/.test(parts[1])) {
        errors.whatsappNumber = "WhatsApp number should include a country code and number";
        isValid = false;
      }
    }

    return { isValid, errors };
  };

  return { validateForm };
}
