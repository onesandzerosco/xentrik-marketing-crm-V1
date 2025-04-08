
import React from "react";
import ImageUploader from "../ImageUploader";

interface ProfilePictureProps {
  profileImage: string;
  name: string;
  setProfileImage: (url: string) => void;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  profileImage,
  name,
  setProfileImage,
}) => {
  return (
    <div className="bg-card rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4">Profile Picture</h2>
      <div className="flex items-center justify-center">
        <ImageUploader 
          currentImage={profileImage} 
          name={name} 
          onImageChange={setProfileImage} 
          size="xl"
          showZoomSlider={true}
        />
      </div>
    </div>
  );
};

export default ProfilePicture;
