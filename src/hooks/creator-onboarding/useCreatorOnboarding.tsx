
import { useFormState } from "./useFormState";
import { useValidation } from "./useValidation";
import { useSubmission } from "./useSubmission";

export function useCreatorOnboarding() {
  const { formState, formActions, setErrors } = useFormState();
  const { validateForm } = useValidation();
  const { isSubmitting, handleSubmit: submitCreator } = useSubmission();

  const handleSubmit = async () => {
    try {
      const { isValid, errors } = validateForm(
        formState.name,
        formState.telegramUsername,
        formState.whatsappNumber
      );

      setErrors(errors);
      
      if (!isValid) {
        console.log("Form validation failed with errors:", errors);
        return undefined;
      }

      console.log("Form validation passed, proceeding with submission");
      const creatorId = await submitCreator(formState);
      
      console.log("Creator submission result:", creatorId);
      return creatorId;
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      // Re-throw the error so it can be caught by the component
      throw error;
    }
  };

  return {
    formState,
    formActions,
    isSubmitting,
    handleSubmit
  };
}
