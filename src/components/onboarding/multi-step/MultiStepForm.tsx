
import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { ChevronLeft, ChevronRight, Save, Upload } from "lucide-react";
import { 
  creatorOnboardingSchema,
  defaultOnboardingValues,
  CreatorOnboardingFormValues
} from "@/schemas/creatorOnboardingSchema";
import { PersonalInfoForm } from "./PersonalInfoForm";
import { PhysicalAttributesForm } from "./PhysicalAttributesForm";
import { PersonalPreferencesForm } from "./PersonalPreferencesForm";
import { ContentAndServiceForm } from "./ContentAndServiceForm";
import { saveOnboardingData } from "@/utils/onboardingUtils";

export const MultiStepForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<string>("personalInfo");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const methods = useForm<CreatorOnboardingFormValues>({
    resolver: zodResolver(creatorOnboardingSchema),
    defaultValues: defaultOnboardingValues,
    mode: "onChange"
  });

  const { formState: { isValid, errors } } = methods;

  const steps = [
    { id: "personalInfo", label: "Personal Info" },
    { id: "physicalAttributes", label: "Physical Attributes" },
    { id: "personalPreferences", label: "Preferences" },
    { id: "contentAndService", label: "Content & Services" }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  
  // Navigation functions - completely separated from form submission
  const goToNextStep = () => {
    console.log("Moving to next step from step:", currentStepIndex);
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  // Only called when the final submit button is explicitly clicked
  const handleFinalSubmit = async (data: CreatorOnboardingFormValues) => {
    try {
      setIsSubmitting(true);
      console.log("Form data being submitted from final step button click:", data);

      // Calculate age from date of birth if provided
      if (data.personalInfo.dateOfBirth) {
        const birthDate = new Date(data.personalInfo.dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        data.personalInfo.age = age;
      }

      // Save to Supabase bucket
      const result = await saveOnboardingData(data);
      
      if (result.success) {
        toast({
          title: "Submission Successful",
          description: "Your onboarding information has been submitted successfully.",
          variant: "default",
        });
      } else {
        throw new Error(result.error || "Failed to submit form");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      {/* Use onSubmit handler only for form validation, not for automatic submission */}
      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        <Card className="w-full bg-[#1a1a33]/70 border-[#252538]/50 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Creator Onboarding</CardTitle>
            <CardDescription>
              Complete the form to onboard a new creator. All information will be saved securely.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={currentStep} onValueChange={setCurrentStep} className="w-full">
              <TabsList className="grid grid-cols-4 mb-8">
                {steps.map((step) => (
                  <TabsTrigger 
                    key={step.id} 
                    value={step.id}
                    className="data-[state=active]:bg-gradient-premium-yellow data-[state=active]:text-black"
                  >
                    {step.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="personalInfo">
                <PersonalInfoForm />
              </TabsContent>
              
              <TabsContent value="physicalAttributes">
                <PhysicalAttributesForm />
              </TabsContent>
              
              <TabsContent value="personalPreferences">
                <PersonalPreferencesForm />
              </TabsContent>
              
              <TabsContent value="contentAndService">
                <ContentAndServiceForm />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-[#252538]/50 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={goToPreviousStep}
              disabled={currentStepIndex === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            
            {currentStepIndex < steps.length - 1 ? (
              <Button
                type="button"
                variant="premium"
                onClick={goToNextStep}
                className="flex items-center gap-2"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button" 
                variant="premium"
                disabled={isSubmitting || !isValid}
                className="flex items-center gap-2"
                onClick={() => methods.handleSubmit(handleFinalSubmit)()}
              >
                {isSubmitting ? (
                  <>Processing <Upload className="h-4 w-4 animate-bounce" /></>
                ) : (
                  <>Submit <Save className="h-4 w-4" /></>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </form>
    </FormProvider>
  );
};

export default MultiStepForm;
