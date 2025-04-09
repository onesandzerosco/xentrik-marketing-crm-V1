
import React from "react";
import { FormLabel } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

// Mock data for creators that could be assigned to team members
const mockCreators = [
  { id: "c1", name: "Creator One" },
  { id: "c2", name: "Creator Two" },
  { id: "c3", name: "Creator Three" },
  { id: "c4", name: "Creator Four" },
  { id: "c5", name: "Creator Five" },
];

interface CreatorsAssignmentSectionProps {
  selectedCreators: string[];
  toggleCreator: (creatorId: string) => void;
}

const CreatorsAssignmentSection: React.FC<CreatorsAssignmentSectionProps> = ({
  selectedCreators,
  toggleCreator,
}) => {
  return (
    <div>
      <FormLabel className="block mb-2">Assigned Creators</FormLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
        {mockCreators.map((creator) => (
          <div key={creator.id} className="flex items-center space-x-2">
            <Checkbox 
              id={`creator-${creator.id}`}
              checked={selectedCreators.includes(creator.id)}
              onCheckedChange={() => toggleCreator(creator.id)}
            />
            <label
              htmlFor={`creator-${creator.id}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {creator.name}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreatorsAssignmentSection;
