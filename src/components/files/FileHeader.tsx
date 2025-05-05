
import React from 'react';
import { Button } from "@/components/ui/button";
import { Upload } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface FileHeaderProps {
  creatorName: string;
  onUploadClick?: () => void;
  isCreatorView?: boolean;
}

export const FileHeader: React.FC<FileHeaderProps> = ({ 
  creatorName, 
  onUploadClick, 
  isCreatorView = false
}) => {
  const { userRole, userRoles } = useAuth();
  
  // Only show upload button for Creators and Admins
  const canUpload = 
    userRole === "Admin" || 
    userRole === "Creator" || 
    userRoles.includes("Creator");

  return (
    <div className="border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{creatorName}'s Files</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and organize files
          </p>
        </div>
        
        <div className="flex gap-2">
          {isCreatorView && canUpload && onUploadClick && (
            <Button onClick={onUploadClick}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
