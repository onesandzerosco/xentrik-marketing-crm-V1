import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import OnboardingBasicInfo from "./OnboardingBasicInfo";
import OnboardingContactInfo from "./OnboardingContactInfo";
import OnboardingSocialLinks from "./OnboardingSocialLinks";
import OnboardingNotes from "./OnboardingNotes";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

const onboardingSchema = z.object({
  name: z.string().min(1, "Creator name is required"),
  email: z.string().email("Invalid email address"),
  gender: z.enum(["Male", "Female", "Trans", "AI"]),
  team: z.enum(["A Team", "B Team", "C Team"]),
  creatorType: z.enum(["Real", "AI"]),
  telegramUsername: z.string().optional(),
  whatsappNumber: z.string().optional(),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
  twitter: z.string().optional(),
  reddit: z.string().optional(),
  chaturbate: z.string().optional(),
  notes: z.string().optional(),
});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;

interface OnboardingFormProps {
  onSubmit: (values: OnboardingFormValues) => void;
  isSubmitting: boolean;
}

const OnboardingForm: React.FC<OnboardingFormProps> = ({ onSubmit, isSubmitting }) => {
  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      email: "",
      gender: "Male",
      team: "A Team",
      creatorType: "Real",
      telegramUsername: "",
      whatsappNumber: "",
      instagram: "",
      tiktok: "",
      twitter: "",
      reddit: "",
      chaturbate: "",
      notes: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <OnboardingBasicInfo control={form.control} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <OnboardingContactInfo control={form.control} />
          <OnboardingSocialLinks control={form.control} />
        </div>
        <OnboardingNotes control={form.control} />
        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={isSubmitting}>
            <Send className="h-4 w-4 mr-2" />
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default OnboardingForm;
