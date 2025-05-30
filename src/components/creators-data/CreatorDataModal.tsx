
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface AcceptedCreator {
  id: string;
  token: string;
  name: string;
  email: string;
  submitted_at: string;
  data: any;
}

interface CreatorDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator: AcceptedCreator;
}

const CreatorDataModal: React.FC<CreatorDataModalProps> = ({
  isOpen,
  onClose,
  creator
}) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-[#1a1a33] text-white border-[#252538]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>Creator Data: {creator.name}</span>
            <Badge variant="secondary" className="bg-green-600 text-white">
              Accepted
            </Badge>
          </DialogTitle>
          <div className="text-sm text-gray-300">
            <p><strong>Email:</strong> {creator.email}</p>
            <p><strong>Submitted:</strong> {formatDate(creator.submitted_at)}</p>
            <p><strong>Token:</strong> <span className="font-mono">{creator.token}</span></p>
          </div>
        </DialogHeader>
        
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-3">Onboarding Form Data (JSON)</h3>
          <ScrollArea className="h-96 w-full rounded-md border border-[#252538] p-4">
            <pre className="text-xs text-white/90 whitespace-pre-wrap break-words">
              {JSON.stringify(creator.data, null, 2)}
            </pre>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatorDataModal;
