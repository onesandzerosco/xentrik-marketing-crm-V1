
import { useFormState } from "./useFormState";
import { useValidation } from "./useValidation";
import { useSubmission } from "./useSubmission";

export function useCreatorOnboarding() {
  const { formState, formActions, setErrors } = useFormState();
  const { validateForm } = useValidation();
  const { isSubmitting, handleSubmit: submitCreator } = useSubmission();

  const handleSubmit = async () => {
    const { isValid, errors } = validateForm(
      formState.name,
      formState.telegramUsername,
      formState.whatsappNumber
    );

    setErrors(errors);
    
    if (!isValid) {
      console.log("Form validation failed with errors:", errors);
      return;
    }

    console.log("Form validation passed, proceeding with submission");
    return await submitCreator(formState);
  };

  return {
    formState,
    formActions,
    isSubmitting,
    handleSubmit
  };
}
