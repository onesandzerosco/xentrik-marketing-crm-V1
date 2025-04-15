
import React from "react";
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { OnboardingFormValues } from "./OnboardingForm";

interface OnboardingContactInfoProps {
  control: Control<OnboardingFormValues>;
}

const OnboardingContactInfo: React.FC<OnboardingContactInfoProps> = ({ control }) => {
  return (
    <div className="bg-[#1a1a33] text-card-foreground rounded-lg border border-[#252538] shadow-sm p-6 space-y-6">
      <h2 className="text-lg font-semibold">Contact Information</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="telegramUsername"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telegram Username</FormLabel>
              <FormControl>
                <Input placeholder="@username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="whatsappNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>WhatsApp Number</FormLabel>
              <FormControl>
                <Input placeholder="+1234567890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default OnboardingContactInfo;
