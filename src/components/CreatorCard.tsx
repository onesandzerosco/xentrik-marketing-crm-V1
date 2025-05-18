
import React from 'react';
import { Link } from 'react-router-dom';
import { Creator } from '@/types';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, FileText, LogIn, Files, Share2, Loader2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface CreatorCardProps {
  creator: Creator;
  variant?: 'default' | 'files';
  fileCount?: number;
  showUploadingIndicator?: boolean;
  uploadingCount?: number;
  permissions?: {
    canEdit: boolean;
    canDelete: boolean;
    canUpload: boolean;
    canDownload: boolean;
  };
}

const CreatorCard = ({ 
  creator, 
  variant = 'default', 
  fileCount = 0, 
  showUploadingIndicator = false,
  uploadingCount = 0,
  permissions 
}: CreatorCardProps) => {
  const { toast } = useToast();
  const { userRole } = useAuth();

  const handleShareButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Generate upload link
    const uploadUrl = `/upload/${creator.id}`;
    
    // Copy link to clipboard
    navigator.clipboard.writeText(`${window.location.origin}${uploadUrl}`);
    
    toast({
      title: "Upload link copied!",
      description: `Share this link with ${creator.name} to let them upload files directly.`,
    });
  };

  // Check if user has Admin privileges or permission to upload
  const isAdmin = userRole === "Admin";
  // Use permissions if provided, otherwise default to only admin having privileges
  const canUpload = permissions?.canUpload || isAdmin;

  return (
    <Card className="p-4 hover:bg-accent/5 transition-colors group cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="shrink-0">
          {creator.profileImage ? (
            <img 
              src={creator.profileImage} 
              alt={creator.name} 
              className="w-12 h-12 rounded-full object-cover border-2 border-primary/20 group-hover:border-primary/40 transition-all"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-premium-highlight/10 flex items-center justify-center">
              <span className="text-lg font-semibold text-primary/60 group-hover:text-primary/80 transition-colors">
                {creator.name[0].toUpperCase()}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="text-left">
              <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">{creator.name}</h3>
              <div className="text-sm text-muted-foreground mt-0.5">
                ID: {creator.id}
              </div>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary" className="bg-pink-900/40 text-pink-200 hover:bg-pink-900/60">
                  {creator.gender}
                </Badge>
                <Badge variant="secondary" className="bg-yellow-900/40 text-yellow-200 hover:bg-yellow-900/60">
                  {creator.team}
                </Badge>
                <Badge variant="secondary" className="bg-blue-900/40 text-blue-200 hover:bg-blue-900/60">
                  {creator.creatorType}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-2 ml-4">
            {variant === 'default' ? (
              // Default view for Creators page - Updated admin buttons for Analytics, Invoices, and Login
              <>
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <Link to={`/creator-analytics/${creator.id}`} onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="ghost" 
                        className="px-3 h-9 bg-gradient-premium-yellow text-black hover:opacity-90 transition-all"
                      >
                        <LineChart className="h-4 w-4 mr-2" />
                        Analytics
                      </Button>
                    </Link>
                    
                    <Link to={`/creator-invoices/${creator.id}`} onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="ghost" 
                        className="px-3 h-9 bg-green-600/80 text-white hover:opacity-90 transition-all"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Invoices
                      </Button>
                    </Link>
                    
                    <Link to={`/secure-logins/${creator.id}`} onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        className="h-9"
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        Login
                      </Button>
                    </Link>
                  </div>
                )}
                
                {/* For non-admin users, just show Analytics */}
                {!isAdmin && (
                  <Link to={`/creator-analytics/${creator.id}`} onClick={(e) => e.stopPropagation()}>
                    <Button 
                      variant="ghost" 
                      className="px-8 h-10 bg-gradient-premium-yellow text-black hover:opacity-90 transition-all"
                    >
                      <LineChart className="h-4 w-4 mr-2" />
                      Analytics
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              // Files view for SharedFiles page - View Files and Share buttons
              <>
                <Link to={`/creator-files/${creator.id}`} onClick={(e) => e.stopPropagation()}>
                  <Button 
                    variant="ghost" 
                    className="px-6 h-10 bg-gradient-premium-yellow text-black hover:opacity-90 transition-all"
                  >
                    <Files className="h-4 w-4 mr-2" />
                    View Files
                    {fileCount > 0 && (
                      <span className="ml-1 bg-primary/20 text-black px-1.5 rounded-full text-xs">
                        {fileCount}
                      </span>
                    )}
                    
                    {showUploadingIndicator && (
                      <span className="ml-2 flex items-center text-xs">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        {uploadingCount} uploading
                      </span>
                    )}
                  </Button>
                </Link>
                {/* Show Share button for users with appropriate permissions */}
                {canUpload && (
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="h-9"
                    onClick={handleShareButtonClick}
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CreatorCard;
