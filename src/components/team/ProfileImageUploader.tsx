
import React, { useCallback, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface ProfileImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  name: string;
}

const ProfileImageUploader: React.FC<ProfileImageUploaderProps> = ({
  value,
  onChange,
  name
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      const file = acceptedFiles[0];
      if (!file) return;
      
      setIsUploading(true);
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;
      
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('team')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data } = supabase
        .storage
        .from('team')
        .getPublicUrl(filePath);
        
      onChange(data.publicUrl);
      
      toast({
        title: "Image Uploaded",
        description: "Your profile image has been updated"
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  }, [onChange, toast]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/gif': [],
      'image/webp': []
    },
    maxFiles: 1,
    multiple: false
  });
  
  const clearImage = () => {
    onChange('');
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center">
        <Avatar className="h-20 w-20 mb-2">
          <AvatarImage src={value} alt={name} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitials(name || 'User')}
          </AvatarFallback>
        </Avatar>
        
        {value && (
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={clearImage}
            className="h-8 px-2"
          >
            <X className="h-4 w-4 mr-1" /> Remove
          </Button>
        )}
      </div>
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-accent/5 transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted'
        }`}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Uploading...</p>
          </div>
        ) : (
          <div className="py-4">
            <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              {isDragActive
                ? "Drop the image here"
                : "Drag & drop an image here, or click to select"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileImageUploader;
