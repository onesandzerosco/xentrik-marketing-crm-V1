
import React from "react";
import ImageUploader from "../ImageUploader";

interface ProfilePictureProps {
  profileImage: string;
  name: string;
  setProfileImage: (url: string) => void;
  hideUploadButton?: boolean;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  profileImage,
  name,
  setProfileImage,
  hideUploadButton = false,
}) => {
  // Handle image change from ImageUploader
  const handleImageChange = (url: string) => {
    // Only update if the URL is not empty
    if (url && url.trim() !== "") {
      // Pass the new image URL up to the parent component
      setProfileImage(url);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-center">
        <ImageUploader 
          currentImage={profileImage} 
          name={name} 
          onImageChange={handleImageChange} 
          size="xl"
          showZoomSlider={true}
          showAutoDetect={false}
        />
      </div>
      {/* Redundant upload button removed */}
    </div>
  );
};

export default ProfilePicture;
