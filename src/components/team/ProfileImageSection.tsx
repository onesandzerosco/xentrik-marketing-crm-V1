
import React from "react";
import ProfilePicture from "../profile/ProfilePicture";

interface ProfileImageSectionProps {
  profileImage: string;
  name: string;
  handleProfileImageChange: (url: string) => void;
}

const ProfileImageSection: React.FC<ProfileImageSectionProps> = ({
  profileImage,
  name,
  handleProfileImageChange,
}) => {
  return (
    <div className="flex-shrink-0 flex flex-col items-center">
      <ProfilePicture 
        profileImage={profileImage || ""}
        name={name}
        setProfileImage={handleProfileImageChange}
      />
    </div>
  );
};

export default ProfileImageSection;
