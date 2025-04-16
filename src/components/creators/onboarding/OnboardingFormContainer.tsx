
import React, { ReactNode } from "react";

interface OnboardingFormContainerProps {
  children: ReactNode;
}

const OnboardingFormContainer: React.FC<OnboardingFormContainerProps> = ({ children }) => {
  return (
    <div className="max-w-6xl mx-auto">
      {children}
      <div className="mt-4 mb-8 text-sm text-gray-400">
        <span className="text-red-500">*</span> Required fields
      </div>
    </div>
  );
};

export default OnboardingFormContainer;
