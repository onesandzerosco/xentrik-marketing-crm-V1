
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
  // Handle image change from ImageUploader
  const handleImageChange = (url: string) => {
    // Only update if the URL is not empty
    if (url && url.trim() !== "") {
      // Pass the new image URL up to the parent component
      setProfileImage(url);
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4">Profile Picture</h2>
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
      <p className="text-xs text-center text-muted-foreground mt-4">
        Upload a square image for best results. The circular mask is for display only and preserves your original image.
      </p>
    </div>
  );
};

export default ProfilePicture;
