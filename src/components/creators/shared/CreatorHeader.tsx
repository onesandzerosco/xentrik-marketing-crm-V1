
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, LineChart, FileText, LogIn } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import SecureLoginModal from "../secure-logins/SecureLoginModal";

interface CreatorHeaderProps {
  title: string;
  onSave: () => void;
  isSubmitting?: boolean;
  badges?: {
    gender?: string;
    team?: string;
    creatorType?: string;
    needsReview?: boolean;
  };
  showAnalytics?: boolean;
  creatorId?: string;
}

const CreatorHeader: React.FC<CreatorHeaderProps> = ({
  title,
  onSave,
  isSubmitting,
  badges,
  showAnalytics,
  creatorId
}) => {
  const { userRole } = useAuth();
  const isAdmin = userRole === "Admin";
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3 mb-8">
        <Link to="/creators">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {badges && (
            <div className="flex flex-wrap gap-2 mt-1">
              {badges.gender && <Badge variant="outline">{badges.gender}</Badge>}
              {badges.team && <Badge variant="outline">{badges.team}</Badge>}
              {badges.creatorType === "AI" && (
                <Badge variant="outline" className="bg-gray-100/10 text-gray-100">AI</Badge>
              )}
              {badges.needsReview && (
                <Badge variant="outline" className="bg-red-900/40 text-red-200">Needs Review</Badge>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-3 ml-auto">
          {isAdmin && creatorId && (
            <>
              {showAnalytics && (
                <Link to={`/creator-analytics/${creatorId}`}>
                  <Button variant="outline">
                    <LineChart className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                </Link>
              )}
              
              <Link to={`/creator-invoices/${creatorId}`}>
                <Button variant="outline" className="bg-green-600/20 text-green-200 border-green-600/30 hover:bg-green-600/30">
                  <FileText className="h-4 w-4 mr-2" />
                  Invoices
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                className="bg-blue-600/20 text-blue-200 border-blue-600/30 hover:bg-blue-600/30"
                onClick={() => setShowLoginModal(true)}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            </>
          )}
          
          {/* Only show Save button for admin users or if explicitly allowed */}
          {isAdmin && (
            <Button 
              onClick={onSave}
              disabled={isSubmitting}
              className="text-black rounded-[15px] px-3 py-2 transition-all hover:bg-gradient-premium-yellow hover:text-black hover:-translate-y-0.5 hover:shadow-premium-yellow hover:opacity-90 bg-gradient-premium-yellow shadow-premium-yellow"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          )}
        </div>
      </div>

      {creatorId && (
        <SecureLoginModal
          open={showLoginModal}
          onOpenChange={setShowLoginModal}
          creatorId={creatorId}
          creatorName={title}
        />
      )}
    </>
  );
};

export default CreatorHeader;
