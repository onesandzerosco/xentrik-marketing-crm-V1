
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AddCustomLinkButtonProps {
  onClick: () => void;
}

const AddCustomLinkButton: React.FC<AddCustomLinkButtonProps> = ({ onClick }) => {
  return (
    <div className="mt-4">
      <Button 
        type="button" 
        variant="outline" 
        className="flex items-center"
        onClick={onClick}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Another Social Media
      </Button>
    </div>
  );
};

export default AddCustomLinkButton;
