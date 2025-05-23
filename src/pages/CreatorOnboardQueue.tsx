
import React, { useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AcceptSubmissionModal from "@/components/onboarding/AcceptSubmissionModal";
import SubmissionsTable from "@/components/onboarding/queue/SubmissionsTable";
import LoadingState from "@/components/onboarding/queue/LoadingState";
import EmptyState from "@/components/onboarding/queue/EmptyState";
import { useOnboardingSubmissions } from "@/hooks/useOnboardingSubmissions";
import { useAcceptSubmission } from "@/hooks/useAcceptSubmission";

const CreatorOnboardQueue: React.FC = () => {
  const { user, userRole } = useAuth();
  
  const {
    submissions,
    loading,
    processingTokens,
    fetchSubmissions,
    togglePreview,
    deleteSubmission,
    setProcessingTokens,
    formatDate
  } = useOnboardingSubmissions();

  const {
    acceptModalOpen,
    selectedSubmission,
    openAcceptModal,
    setAcceptModalOpen,
    handleAcceptSubmission,
    isProcessing,
    processedTokens
  } = useAcceptSubmission(deleteSubmission, setProcessingTokens);
  
  // Use memoization to filter submissions only when dependencies change
  const availableSubmissions = useMemo(() => {
    return submissions.filter(sub => !processedTokens.has(sub.token));
  }, [submissions, processedTokens]);

  // Only allow admins to access this page
  if (userRole !== "Admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="p-8 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-white">Creator Onboarding Queue</h1>
        <p className="text-muted-foreground">
          Review and approve creator onboarding submissions.
        </p>
      </div>
      
      <Card className="bg-[#1a1a33]/50 backdrop-blur-sm border border-[#252538]/50">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Pending Submissions</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchSubmissions}
              disabled={loading}
              className="text-white border-white/20"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                "Refresh"
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingState />
          ) : availableSubmissions.length === 0 ? (
            <EmptyState />
          ) : (
            <SubmissionsTable 
              submissions={availableSubmissions}
              processingTokens={processingTokens}
              formatDate={formatDate}
              togglePreview={togglePreview}
              deleteSubmission={deleteSubmission}
              onAcceptClick={openAcceptModal}
            />
          )}
        </CardContent>
      </Card>
      
      {/* Acceptance Modal */}
      {selectedSubmission && (
        <AcceptSubmissionModal
          isOpen={acceptModalOpen}
          onClose={() => setAcceptModalOpen(false)}
          onAccept={handleAcceptSubmission}
          defaultName={selectedSubmission.name}
          isLoading={isProcessing || processingTokens.includes(selectedSubmission.token)}
        />
      )}
    </div>
  );
};

export default CreatorOnboardQueue;
