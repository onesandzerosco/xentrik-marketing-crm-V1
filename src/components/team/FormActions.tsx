
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
        className="rounded-xl transition-all duration-300 hover:opacity-90"
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        className="bg-brand-yellow text-black hover:bg-brand-highlight rounded-xl transition-all duration-300 hover:opacity-90 transform hover:-translate-y-1"
      >
        <Save className="h-4 w-4 mr-2" />
        Save Changes
      </Button>
    </div>
  );
};

export default FormActions;
