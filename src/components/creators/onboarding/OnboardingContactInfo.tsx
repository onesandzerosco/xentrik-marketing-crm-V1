
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
    <div className="space-y-6 rounded-2xl bg-gradient-to-br from-[#1a1a33]/50 to-[#1a1a33]/30 backdrop-blur-sm p-8 border border-[#252538]/50 shadow-lg">
      <h2 className="text-xl font-semibold mb-6">Contact Information</h2>
      <div className="grid gap-6 sm:grid-cols-2">
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
