
import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface ImageUploaderProps {
  currentImage: string;
  name: string;
  onImageChange: (imagePath: string) => void;
  size?: "sm" | "md" | "lg" | "xl";
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  currentImage, 
  name, 
  onImageChange,
  size = "lg" 
}) => {
  const [previewImage, setPreviewImage] = useState<string>(currentImage);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32",
    xl: "h-40 w-40"
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file) {
      // Create a local preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
      
      // In a real app, you'd upload the file to a server here
      // For this example, we'll just use the object URL
      onImageChange(objectUrl);
    }
  };

  const initials = name
    .split(" ")
    .map(part => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="flex flex-col items-center gap-3">
      <div 
        className="relative cursor-pointer group"
        onClick={handleClick}
      >
        <Avatar className={`${sizeClasses[size]} border-2 border-border`}>
          <AvatarImage src={previewImage} alt={name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <Upload className="h-6 w-6 text-white" />
        </div>
      </div>
      
      <Button 
        type="button" 
        variant="outline" 
        size="sm"
        onClick={handleClick}
      >
        Upload Photo
      </Button>
      
      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden" 
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ImageUploader;
