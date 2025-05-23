
import React from "react";
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
  deleteSubmission: (token: string) => Promise<void>;
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
  
  const handleDeleteClick = (token: string) => {
    if (processingTokens.includes(token) || clickedButtons[token]) {
      console.log("Skipping delete action - token already processing or button clicked:", token);
      return;
    }
    
    // Mark this button as clicked
    setClickedButtons(prev => ({ ...prev, [token]: true }));
    
    // Process the deletion
    console.log("Delete button clicked for token:", token);
    deleteSubmission(token).finally(() => {
      // Reset clicked state after completion
      setClickedButtons(prev => ({ ...prev, [token]: false }));
    });
  };
  
  const handleAcceptClick = (submission: OnboardSubmission) => {
    const token = submission.token;
    if (processingTokens.includes(token) || clickedButtons[token]) {
      console.log("Skipping accept action - token already processing or button clicked:", token);
      return;
    }
    
    // Mark this button as clicked
    setClickedButtons(prev => ({ ...prev, [token]: true }));
    
    // Process the acceptance
    console.log("Accept button clicked for token:", token);
    onAcceptClick(submission);
    
    // We'll reset this when the modal closes or the action completes
    setTimeout(() => {
      setClickedButtons(prev => ({ ...prev, [token]: false }));
    }, 5000);
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
                    onClick={() => handleDeleteClick(submission.token)}
                    disabled={processingTokens.includes(submission.token) || clickedButtons[submission.token]}
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
                    disabled={processingTokens.includes(submission.token) || clickedButtons[submission.token]}
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
