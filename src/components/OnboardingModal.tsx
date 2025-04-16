
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import OnboardingForm from "./onboarding/OnboardingForm";

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ open, onOpenChange }) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Onboard New Creator</SheetTitle>
        </SheetHeader>
        
        <OnboardingForm onCloseModal={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  );
};

export default OnboardingModal;
