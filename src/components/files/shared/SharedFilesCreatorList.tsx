
import React from "react";
import { Loader2 } from "lucide-react";
import { Creator } from "@/types";
import CreatorCard from "@/components/CreatorCard";
import SharedFilesEmptyState from "./SharedFilesEmptyState";
import { useAuth } from "@/context/AuthContext";

interface SharedFilesCreatorListProps {
  isLoading: boolean;
  creators: Creator[];
  hasFilters: boolean;
  fileCountsMap?: Record<string, { total: number; uploading: number }>;
  permissions?: {
    canEdit: boolean;
    canDelete: boolean;
    canUpload: boolean;
    canDownload: boolean;
  };
}

const SharedFilesCreatorList: React.FC<SharedFilesCreatorListProps> = ({ 
  isLoading, 
  creators, 
  hasFilters,
  fileCountsMap = {},
  permissions
}) => {
  const { userRole } = useAuth();
  const isAdmin = userRole === "Admin";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading creators...</span>
      </div>
    );
  }

  if (creators.length === 0) {
    return <SharedFilesEmptyState hasFilters={hasFilters} />;
  }

  return (
    <div className="space-y-2">
      {creators.map(creator => {
        const fileCount = fileCountsMap[creator.id]?.total || 0;
        const uploadingCount = fileCountsMap[creator.id]?.uploading || 0;
        
        return (
          <div key={creator.id}>
            <CreatorCard 
              creator={creator} 
              variant="files"
              fileCount={fileCount}
              showUploadingIndicator={uploadingCount > 0}
              uploadingCount={uploadingCount}
              permissions={permissions}
            />
          </div>
        );
      })}
    </div>
  );
}

export default SharedFilesCreatorList;
