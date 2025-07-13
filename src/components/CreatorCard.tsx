
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
        return "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border-blue-500/20";
      case 'female':
        return "bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 border-pink-500/20";
      case 'trans':
        return "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border-purple-500/20";
      default:
        return "bg-gray-500/20 text-gray-300 hover:bg-gray-500/30 border-gray-500/20";
    }
  };

  return (
    <>
      <Card className="p-4 md:p-6 hover:bg-accent/5 transition-colors group cursor-pointer">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          <div className="flex items-start gap-4 md:gap-6">
            <div className="shrink-0">
              {creator.profileImage ? (
                <img 
                  src={creator.profileImage} 
                  alt={creator.name} 
                  className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover border-2 border-primary/20 group-hover:border-primary/40 transition-all"
                />
              ) : (
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-premium-highlight/10 flex items-center justify-center">
                  <span className="text-xl md:text-2xl font-semibold text-primary/60 group-hover:text-primary/80 transition-colors">
                    {creator.name[0].toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
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
                    className={`${getGenderBadgeClass(creator.gender)} text-xs md:text-sm px-3 py-1.5 border`}
                  >
                    {creator.gender}
                  </Badge>
                  <Badge 
                    variant="secondary" 
                    className="bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 border-yellow-500/20 text-xs md:text-sm px-3 py-1.5 border"
                  >
                    {creator.team}
                  </Badge>
                  <Badge 
                    variant="secondary" 
                    className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border-blue-500/20 text-xs md:text-sm px-3 py-1.5 border"
                  >
                    {creator.creatorType}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          
          <div className={`flex ${isMobile ? 'flex-col w-full gap-3' : 'items-center justify-end gap-3 flex-shrink-0'}`}>
            {variant === 'default' ? (
              // Default view for Creators page
              <>
                {isAdmin && (
                  <div className={`flex ${isMobile ? 'flex-col w-full gap-3' : 'items-center gap-3'}`}>
                    <Link to={`/creator-analytics/${creator.id}`} onClick={(e) => e.stopPropagation()} className={isMobile ? 'w-full' : ''}>
                      <Button 
                        variant="ghost" 
                        size={isMobile ? "default" : "default"}
                        className={`${isMobile ? 'w-full h-11 text-base' : 'px-4 h-10'} bg-gradient-premium-yellow text-black hover:opacity-90 transition-all`}
                      >
                        <LineChart className="h-4 w-4 mr-2" />
                        Analytics
                      </Button>
                    </Link>
                    
                    <Link to={`/creator-invoices/${creator.id}`} onClick={(e) => e.stopPropagation()} className={isMobile ? 'w-full' : ''}>
                      <Button 
                        variant="ghost" 
                        size={isMobile ? "default" : "default"}
                        className={`${isMobile ? 'w-full h-11 text-base' : 'px-4 h-10'} bg-green-600/80 text-white hover:opacity-90 transition-all`}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Invoices
                      </Button>
                    </Link>
                    
                    <Button 
                      variant="secondary" 
                      size={isMobile ? "default" : "default"}
                      className={`${isMobile ? 'w-full h-11 text-base' : 'h-10 px-4'}`}
                      onClick={handleLoginButtonClick}
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Login
                    </Button>
                  </div>
                )}
                
                {/* For non-admin users, just show Analytics */}
                {!isAdmin && (
                  <Link to={`/creator-analytics/${creator.id}`} onClick={(e) => e.stopPropagation()} className={isMobile ? 'w-full' : ''}>
                    <Button 
                      variant="ghost" 
                      size={isMobile ? "default" : "default"}
                      className={`${isMobile ? 'w-full h-11 text-base px-6' : 'px-8 h-10'} bg-gradient-premium-yellow text-black hover:opacity-90 transition-all`}
                    >
                      <LineChart className="h-4 w-4 mr-2" />
                      Analytics
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              // Files view for SharedFiles page
              <div className={`flex ${isMobile ? 'flex-col w-full gap-3' : 'items-center gap-3'}`}>
                <Link to={`/creator-files/${creator.id}`} onClick={(e) => e.stopPropagation()} className={isMobile ? 'w-full' : ''}>
                  <Button 
                    variant="ghost" 
                    size={isMobile ? "default" : "default"}
                    className={`${isMobile ? 'w-full h-11 text-base' : 'px-6 h-10'} bg-gradient-premium-yellow text-black hover:opacity-90 transition-all`}
                  >
                    <Files className="h-4 w-4 mr-2" />
                    Files
                    {fileCount > 0 && (
                      <span className="ml-2 bg-primary/20 text-black px-2 py-0.5 rounded-full text-xs">
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
                
                <Link to={`/creator-analytics/${creator.id}?tab=income`} onClick={(e) => e.stopPropagation()} className={isMobile ? 'w-full' : ''}>
                  <Button 
                    variant="ghost" 
                    size={isMobile ? "default" : "default"}
                    className={`${isMobile ? 'w-full h-11 text-base' : 'px-4 h-10'} bg-green-600/80 text-white hover:opacity-90 transition-all`}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Income
                  </Button>
                </Link>
                
                {/* Show Share button for users with appropriate permissions */}
                {canUpload && (
                  <Button 
                    variant="secondary" 
                    size={isMobile ? "default" : "default"}
                    className={`${isMobile ? 'w-full h-11 text-base' : 'h-10 px-4'}`}
                    onClick={handleShareButtonClick}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                )}
              </div>
            )}
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
