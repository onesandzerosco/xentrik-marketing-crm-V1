
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Creator } from '@/types';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, FileText, LogIn, Files, Share2, Loader2, DollarSign } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import SecureLoginModal from './creators/secure-logins/SecureLoginModal';

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
  const isMobile = useIsMobile();
  const [showLoginModal, setShowLoginModal] = useState(false);

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

  const handleLoginButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowLoginModal(true);
  };

  // Check if user has Admin privileges or permission to upload
  const isAdmin = userRole === "Admin";
  // Use permissions if provided, otherwise default to only admin having privileges
  const canUpload = permissions?.canUpload || isAdmin;

  // Get gender-specific badge styling
  const getGenderBadgeClass = (gender: string) => {
    switch (gender.toLowerCase()) {
      case 'male':
        return "bg-blue-900/40 text-blue-200 hover:bg-blue-900/60";
      case 'female':
        return "bg-pink-900/40 text-pink-200 hover:bg-pink-900/60";
      case 'trans':
        return "bg-purple-900/40 text-purple-200 hover:bg-purple-900/60";
      default:
        return "bg-gray-900/40 text-gray-200 hover:bg-gray-900/60";
    }
  };

  return (
    <>
      <Card className="p-4 md:p-6 hover:bg-accent/5 transition-colors group cursor-pointer">
        <div className="flex items-start md:items-center gap-4 md:gap-6">
          <div className="shrink-0">
            {creator.profileImage ? (
              <img 
                src={creator.profileImage} 
                alt={creator.name} 
                className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-primary/20 group-hover:border-primary/40 transition-all"
              />
            ) : (
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-premium-highlight/10 flex items-center justify-center">
                <span className="text-lg md:text-xl font-semibold text-primary/60 group-hover:text-primary/80 transition-colors">
                  {creator.name[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col min-w-0">
                <div className="text-left">
                  <h3 className="text-xl md:text-2xl font-semibold group-hover:text-primary transition-colors truncate mb-1">
                    {creator.name}
                  </h3>
                  {creator.email && (
                    <div className="text-sm md:text-base text-muted-foreground mb-3">
                      {creator.email}
                    </div>
                  )}
                  <div className="flex gap-2 md:gap-3 mt-2 flex-wrap">
                    <Badge 
                      variant="secondary" 
                      className={`${getGenderBadgeClass(creator.gender)} text-xs md:text-sm px-3 py-1`}
                    >
                      {creator.gender}
                    </Badge>
                    <Badge 
                      variant="secondary" 
                      className="bg-yellow-900/40 text-yellow-200 hover:bg-yellow-900/60 text-xs md:text-sm px-3 py-1"
                    >
                      {creator.team}
                    </Badge>
                    <Badge 
                      variant="secondary" 
                      className="bg-blue-900/40 text-blue-200 hover:bg-blue-900/60 text-xs md:text-sm px-3 py-1"
                    >
                      {creator.creatorType}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-1.5 md:gap-3 flex-shrink-0">
                {variant === 'default' ? (
                  // Default view for Creators page
                  <>
                    {isAdmin && (
                      <div className="flex items-center gap-1.5 md:gap-3">
                        <Link to={`/creator-analytics/${creator.id}`} onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="ghost" 
                            size={isMobile ? "sm" : "default"}
                            className={`${isMobile ? 'px-2 h-8 text-xs' : 'px-4 h-10'} bg-gradient-premium-yellow text-black hover:opacity-90 transition-all`}
                          >
                            <LineChart className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
                            {isMobile ? 'Analytics' : 'Analytics'}
                          </Button>
                        </Link>
                        
                        <Link to={`/creator-invoices/${creator.id}`} onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="ghost" 
                            size={isMobile ? "sm" : "default"}
                            className={`${isMobile ? 'px-2 h-8 text-xs' : 'px-4 h-10'} bg-green-600/80 text-white hover:opacity-90 transition-all`}
                          >
                            <FileText className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
                            {isMobile ? 'Invoices' : 'Invoices'}
                          </Button>
                        </Link>
                        
                        <Button 
                          variant="secondary" 
                          size={isMobile ? "sm" : "default"}
                          className={`${isMobile ? 'h-8 px-2 text-xs' : 'h-10 px-4'}`}
                          onClick={handleLoginButtonClick}
                        >
                          <LogIn className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
                          {isMobile ? 'Login' : 'Login'}
                        </Button>
                      </div>
                    )}
                    
                    {/* For non-admin users, just show Analytics */}
                    {!isAdmin && (
                      <Link to={`/creator-analytics/${creator.id}`} onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size={isMobile ? "sm" : "default"}
                          className={`${isMobile ? 'px-4 h-8 text-xs' : 'px-8 h-10'} bg-gradient-premium-yellow text-black hover:opacity-90 transition-all`}
                        >
                          <LineChart className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
                          Analytics
                        </Button>
                      </Link>
                    )}
                  </>
                ) : (
                  // Files view for SharedFiles page
                  <div className="flex items-center gap-1.5 md:gap-3">
                    <Link to={`/creator-files/${creator.id}`} onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="ghost" 
                        size={isMobile ? "sm" : "default"}
                        className={`${isMobile ? 'px-2 h-8 text-xs' : 'px-6 h-10'} bg-gradient-premium-yellow text-black hover:opacity-90 transition-all`}
                      >
                        <Files className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
                        Files
                        {fileCount > 0 && (
                          <span className={`ml-1 bg-primary/20 text-black px-1.5 py-0.5 rounded-full ${isMobile ? 'text-xs' : 'text-xs'}`}>
                            {fileCount}
                          </span>
                        )}
                        
                        {showUploadingIndicator && (
                          <span className={`ml-1 flex items-center ${isMobile ? 'text-xs' : 'text-xs'}`}>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            {uploadingCount}
                          </span>
                        )}
                      </Button>
                    </Link>
                    
                    <Link to={`/creator-analytics/${creator.id}?tab=income`} onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="ghost" 
                        size={isMobile ? "sm" : "default"}
                        className={`${isMobile ? 'px-2 h-8 text-xs' : 'px-4 h-10'} bg-green-600/80 text-white hover:opacity-90 transition-all`}
                      >
                        <DollarSign className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
                        {isMobile ? 'Income' : 'Income'}
                      </Button>
                    </Link>
                    
                    {/* Show Share button for users with appropriate permissions */}
                    {canUpload && (
                      <Button 
                        variant="secondary" 
                        size={isMobile ? "sm" : "default"}
                        className={`${isMobile ? 'h-8 px-2' : 'h-10 px-4'}`}
                        onClick={handleShareButtonClick}
                      >
                        <Share2 className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                        {!isMobile && <span className="ml-2">Share</span>}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <SecureLoginModal 
        open={showLoginModal} 
        onOpenChange={setShowLoginModal} 
        creatorId={creator.id} 
        creatorName={creator.name}
      />
    </>
  );
};

export default CreatorCard;
