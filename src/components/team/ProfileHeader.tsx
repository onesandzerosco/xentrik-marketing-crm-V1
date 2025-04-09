
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ProfileHeaderProps {
  name: string;
  handleBack: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  handleBack,
}) => {
  return (
    <div className="flex items-center mb-8">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleBack}
        className="mr-4"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <div>
        <h1 className="text-3xl font-bold">{name || "Team Member Profile"}</h1>
        <p className="text-muted-foreground">Edit team member information</p>
      </div>
    </div>
  );
};

export default ProfileHeader;
