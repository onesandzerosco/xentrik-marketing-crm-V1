
import React from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import ImageUploader from "../ImageUploader";

interface ProfilePictureProps {
  profileImage: string;
  name: string;
  setProfileImage: (url: string) => void;
  onSave: () => void;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  profileImage,
  name,
  setProfileImage,
  onSave,
}) => {
  return (
    <div className="bg-card rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4">Profile Picture</h2>
      <div className="flex items-center justify-center py-4">
        <ImageUploader currentImage={profileImage} name={name} onImageChange={setProfileImage} size="xl" />
      </div>
      <Button 
        onClick={onSave} 
        className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white"
      >
        <Save className="h-4 w-4 mr-2" />
        Save Changes
      </Button>
    </div>
  );
};

export default ProfilePicture;
