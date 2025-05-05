
import React from 'react';
import { Button } from "@/components/ui/button";
import { Upload } from 'lucide-react';
import { useFilePermissions } from '@/utils/permissionUtils';
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
  const { canUpload } = useFilePermissions();
  const { userRole, userRoles } = useAuth();
  
  // Check if user is a VA but not a creator or admin
  const isOnlyVA = (userRole === "VA" || userRoles.includes("VA")) && 
                  !userRoles.includes("Creator") && 
                  userRole !== "Creator" && 
                  userRole !== "Admin";
  
  // Only show upload button if user has upload permission AND is not only a VA
  const showUploadButton = isCreatorView && canUpload && !isOnlyVA && onUploadClick;
  
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
          {showUploadButton && (
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
