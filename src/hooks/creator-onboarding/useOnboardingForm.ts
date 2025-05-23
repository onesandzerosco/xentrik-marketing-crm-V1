
import { useFormHandlers } from "./useFormHandlers";
import { useFormValidation } from "./useFormValidation";
import { useFormSubmission } from "./useFormSubmission";

export function useOnboardingForm(onSuccess?: () => void) {
  const { formState, formActions, setErrors } = useFormHandlers();
  const { validateForm } = useFormValidation();
  const { handleSubmit: submitForm } = useFormSubmission();

  const handleSubmit = () => {
    const { isValid, errors } = validateForm(
      formState.name,
      formState.telegramUsername,
      formState.whatsappNumber
    );

    setErrors(errors);

    if (!isValid) {
      return;
    }

    submitForm(formState);
    
    if (onSuccess) {
      onSuccess();
    }
    
    // Reset form
    Object.values(formActions).forEach(setter => {
      if (typeof setter === 'function') {
        setter('' as any);
      }
    });
    setErrors({});
  };

  return {
    formState,
    formActions,
    handleSubmit
  };
}
