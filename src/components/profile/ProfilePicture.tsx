
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
      <button className="mt-4 px-4 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-md flex items-center justify-center text-sm">
        Upload Photo
      </button>
    </div>
  );
};

export default ProfilePicture;
