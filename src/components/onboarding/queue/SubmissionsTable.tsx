
import React, { useMemo } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, Check, Loader2 } from "lucide-react";
import { OnboardSubmission } from "@/hooks/useOnboardingSubmissions";

interface SubmissionsTableProps {
  submissions: OnboardSubmission[];
  processingTokens: string[];
  formatDate: (dateString: string) => string;
  togglePreview: (token: string) => void;
  deleteSubmission: (token: string) => Promise<void>; // This is now the decline function
  onAcceptClick: (submission: OnboardSubmission) => void;
}

const SubmissionsTable: React.FC<SubmissionsTableProps> = ({
  submissions,
  processingTokens,
  formatDate,
  togglePreview,
  deleteSubmission,
  onAcceptClick
}) => {
  // Track buttons that have been clicked to prevent double clicks
  const [clickedButtons, setClickedButtons] = React.useState<Record<string, boolean>>({});
  const [handlingTokens, setHandlingTokens] = React.useState<Set<string>>(new Set());
  
  // Use useMemo for derived state that depends on other state values
  const disabledTokens = useMemo(() => {
    const tokens = new Set<string>();
    
    // Add all processing tokens
    processingTokens.forEach(token => tokens.add(token));
    
    // Add all clicked buttons
    Object.entries(clickedButtons)
      .filter(([_, isClicked]) => isClicked)
      .forEach(([token]) => tokens.add(token));
    
    // Add all handling tokens
    handlingTokens.forEach(token => tokens.add(token));
    
    return tokens;
  }, [processingTokens, clickedButtons, handlingTokens]);
  
  const handleDeclineClick = async (token: string) => {
    if (disabledTokens.has(token)) {
      console.log("Skipping decline action - token already being handled:", token);
      return;
    }
    
    try {
      // Mark this button as clicked and token as being handled
      setClickedButtons(prev => ({ ...prev, [token]: true }));
      setHandlingTokens(prev => new Set(prev).add(token));
      
      // Process the deletion (now decline)
      console.log("Decline button clicked for token:", token);
      await deleteSubmission(token);
    } finally {
      // Reset clicked state after completion
      setClickedButtons(prev => ({ ...prev, [token]: false }));
      setHandlingTokens(prev => {
        const newSet = new Set(prev);
        newSet.delete(token);
        return newSet;
      });
    }
  };
  
  const handleAcceptClick = (submission: OnboardSubmission) => {
    const token = submission.token;
    if (disabledTokens.has(token)) {
      console.log("Skipping accept action - token already being handled:", token);
      return;
    }
    
    // Mark this button as clicked and token as being handled
    setClickedButtons(prev => ({ ...prev, [token]: true }));
    setHandlingTokens(prev => new Set(prev).add(token));
    
    // Process the acceptance
    console.log("Accept button clicked for token:", token);
    onAcceptClick(submission);
    
    // We'll reset this when modal closes or action completes
    setTimeout(() => {
      setClickedButtons(prev => ({ ...prev, [token]: false }));
      setHandlingTokens(prev => {
        const newSet = new Set(prev);
        newSet.delete(token);
        return newSet;
      });
    }, 10000); // Timeout as safety measure
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {submissions.map((submission) => (
          <React.Fragment key={submission.token}>
            <TableRow>
              <TableCell>{submission.email}</TableCell>
              <TableCell>{submission.name}</TableCell>
              <TableCell>
                {formatDate(submission.submittedAt)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => togglePreview(submission.token)}
                    title="Toggle preview"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeclineClick(submission.token)}
                    disabled={disabledTokens.has(submission.token)}
                    title="Decline submission"
                  >
                    {processingTokens.includes(submission.token) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleAcceptClick(submission)}
                    disabled={disabledTokens.has(submission.token)}
                    title="Approve creator"
                  >
                    {processingTokens.includes(submission.token) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            {submission.showPreview && (
              <TableRow>
                <TableCell colSpan={4} className="bg-muted/10">
                  <div className="p-2 rounded overflow-auto max-h-96">
                    <pre className="text-xs text-white/80">
                      {JSON.stringify(submission.data, null, 2)}
                    </pre>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </React.Fragment>
        ))}
      </TableBody>
    </Table>
  );
};

export default SubmissionsTable;
