
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
        className="text-black rounded-[15px] px-3 py-2 transition-all hover:bg-gradient-premium-yellow hover:text-black hover:-translate-y-0.5 hover:shadow-premium-yellow hover:opacity-90 bg-gradient-premium-yellow shadow-premium-yellow"
        variant="default"
      >
        <Save className="h-4 w-4 mr-2" />
        Save Changes
      </Button>
    </div>
  );
};

export default FormActions;
