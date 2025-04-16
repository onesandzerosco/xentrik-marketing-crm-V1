
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
    <div>
      <h2 className="text-xl font-bold mb-4 text-center">Profile Picture</h2>
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
    </div>
  );
};

export default ProfilePicture;
