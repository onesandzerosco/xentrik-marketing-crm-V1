
import React from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface FormActionsProps {
  handleBack: () => void;
}

const FormActions: React.FC<FormActionsProps> = ({
  handleBack,
}) => {
  return (
    <div className="flex justify-end space-x-4 mt-6">
      <Button 
        type="button" 
        variant="outline" 
        onClick={handleBack}
        className="transition-all duration-300 hover:opacity-90"
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        variant="premium"
        className="transition-all duration-300 hover:translate-y-[-2px]"
      >
        <Save className="h-4 w-4 mr-2" />
        Save Changes
      </Button>
    </div>
  );
};

export default FormActions;
