
import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { ChevronLeft, ChevronRight, Save, Upload, CheckCircle2, Download } from "lucide-react";
import { 
  creatorOnboardingSchema,
  defaultOnboardingValues,
  CreatorOnboardingFormValues
} from "@/schemas/creatorOnboardingSchema";
import { PersonalInfoForm } from "./PersonalInfoForm";
import { PhysicalAttributesForm } from "./PhysicalAttributesForm";
import { PersonalPreferencesForm } from "./PersonalPreferencesForm";
import { ContentAndServiceForm } from "./ContentAndServiceForm";
import { saveOnboardingData, validateToken } from "@/utils/onboardingUtils";

interface MultiStepFormProps {
  token?: string;
}

export const MultiStepForm: React.FC<MultiStepFormProps> = ({ token }) => {
  const [currentStep, setCurrentStep] = useState<string>("personalInfo");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  
  const methods = useForm<CreatorOnboardingFormValues>({
    resolver: zodResolver(creatorOnboardingSchema),
    defaultValues: defaultOnboardingValues,
    mode: "onChange"
  });

  const { formState: { isValid, errors } } = methods;

  // Validate token on component mount
  useEffect(() => {
    if (token) {
      validateToken(token).then(isValid => {
        setTokenValid(isValid);
        if (!isValid) {
          toast({
            title: "Invalid or Expired Link",
            description: "This onboarding link is invalid or has already been used.",
            variant: "destructive",
          });
        }
      });
    } else {
      setTokenValid(true); // No token required for admin access
    }
  }, [token, toast]);

  const steps = [
    { id: "personalInfo", label: "Personal Info" },
    { id: "physicalAttributes", label: "Physical Attributes" },
    { id: "personalPreferences", label: "Preferences" },
    { id: "contentAndService", label: "Content & Services" }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  
  const goToNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const handleContentGuideDownload = () => {
    // Extract document ID from the Google Docs URL and create direct PDF export link
    const docId = '1LcUGvtlCQsZFGliXHTxCUcV8U6LARvKjDpKD55yKHqs';
    const pdfExportUrl = `https://docs.google.com/document/d/${docId}/export?format=pdf`;
    
    // Create a temporary link element to trigger download
    const link = document.createElement('a');
    link.href = pdfExportUrl;
    link.download = 'Content-Guide.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFinalSubmit = async (data: CreatorOnboardingFormValues) => {
    try {
      setIsSubmitting(true);
      console.log("Form data being submitted:", data);

      // Format date of birth from YYYY-MM-DD to "March 08, 2002" format
      if (data.personalInfo.dateOfBirth) {
        const dateObject = new Date(data.personalInfo.dateOfBirth);
        // Check if the date is valid
        if (!isNaN(dateObject.getTime())) {
          data.personalInfo.dateOfBirth = format(dateObject, "MMMM dd, yyyy");
        }
      }

      // Age is now manually entered by the user, no automatic calculation needed
      // The age field will be saved as provided by the user (or undefined if not provided)

      // Save to Supabase with the provided token
      const result = await saveOnboardingData(data, token);
      
      if (result.success) {
        toast({
          title: "Submission Successful",
          description: "Your onboarding information has been submitted successfully.",
          variant: "default",
        });
        setIsSubmitted(true);
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

  // Show loading state while validating token
  if (token && tokenValid === null) {
    return (
      <Card className="w-full bg-[#1a1a33]/70 border-[#252538]/50 shadow-xl">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Upload className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-white">Validating invitation link...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state for invalid token
  if (token && tokenValid === false) {
    return (
      <Card className="w-full bg-[#1a1a33]/70 border-[#252538]/50 shadow-xl">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-400 mb-4">This onboarding link is invalid or has expired.</p>
            <p className="text-gray-400">Please contact an administrator for a new link.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show success state after submission
  if (isSubmitted) {
    return (
      <Card className="w-full bg-[#1a1a33]/70 border-[#252538]/50 shadow-xl">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center max-w-md">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">Form Successfully Submitted!</h2>
            <p className="text-gray-300 mb-6">
              Thank you for completing the onboarding process. Your information has been received and will be reviewed by our team.
            </p>
            <p className="text-gray-300 mb-6">
              To get started with creating content, download our comprehensive content guide below. This guide will help you understand our content requirements and best practices.
            </p>
            <Button 
              onClick={handleContentGuideDownload}
              className="mb-6 bg-gradient-premium-yellow text-black hover:shadow-premium-yellow"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Content Guide
            </Button>
            <p className="text-gray-400 text-sm">
              You can now close this page. We'll be in touch soon!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        <Card className="w-full bg-[#1a1a33]/70 border-[#252538]/50 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Creator Onboarding</CardTitle>
            <CardDescription>
              Complete the form to save information about <span className="bg-gradient-premium-yellow bg-clip-text text-transparent font-semibold">how you want to be marketed</span>. We promise to save this data securely.
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
