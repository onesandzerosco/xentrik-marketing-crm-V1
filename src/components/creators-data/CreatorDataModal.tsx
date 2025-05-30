
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface CreatorSubmission {
  id: string;
  name: string;
  email: string;
  submitted_at: string;
  data: any;
  token: string;
}

interface CreatorDataModalProps {
  submission: CreatorSubmission | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreatorDataModal: React.FC<CreatorDataModalProps> = ({
  submission,
  open,
  onOpenChange,
}) => {
  if (!submission) return null;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const renderJsonValue = (key: string, value: any, level: number = 0): React.ReactNode => {
    const indent = '  '.repeat(level);
    
    if (value === null || value === undefined) {
      return (
        <div key={key} className="font-mono text-sm">
          <span className="text-blue-600">{indent}"{key}"</span>: 
          <span className="text-gray-500 ml-2">null</span>
        </div>
      );
    }
    
    if (typeof value === 'boolean') {
      return (
        <div key={key} className="font-mono text-sm">
          <span className="text-blue-600">{indent}"{key}"</span>: 
          <span className="text-orange-600 ml-2">{value.toString()}</span>
        </div>
      );
    }
    
    if (typeof value === 'number') {
      return (
        <div key={key} className="font-mono text-sm">
          <span className="text-blue-600">{indent}"{key}"</span>: 
          <span className="text-green-600 ml-2">{value}</span>
        </div>
      );
    }
    
    if (typeof value === 'string') {
      return (
        <div key={key} className="font-mono text-sm">
          <span className="text-blue-600">{indent}"{key}"</span>: 
          <span className="text-red-600 ml-2">"{value}"</span>
        </div>
      );
    }
    
    if (Array.isArray(value)) {
      return (
        <div key={key} className="font-mono text-sm">
          <span className="text-blue-600">{indent}"{key}"</span>: [
          {value.map((item, index) => (
            <div key={index} className="ml-4">
              {typeof item === 'object' && item !== null ? 
                Object.entries(item).map(([k, v]) => renderJsonValue(k, v, level + 2)) :
                <span className="text-red-600">"{item}"</span>
              }
            </div>
          ))}
          <div className="font-mono text-sm">{indent}]</div>
        </div>
      );
    }
    
    if (typeof value === 'object') {
      return (
        <div key={key} className="font-mono text-sm">
          <span className="text-blue-600">{indent}"{key}"</span>: {'{'}
          <div className="ml-4">
            {Object.entries(value).map(([k, v]) => renderJsonValue(k, v, level + 1))}
          </div>
          <div className="font-mono text-sm">{indent}{'}'}</div>
        </div>
      );
    }
    
    return (
      <div key={key} className="font-mono text-sm">
        <span className="text-blue-600">{indent}"{key}"</span>: 
        <span className="ml-2">{String(value)}</span>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Creator JSON Data
            <Badge variant="secondary">Accepted</Badge>
          </DialogTitle>
          <DialogDescription>
            Viewing JSON data for {submission.name} (submitted {formatDate(submission.submitted_at)})
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
          <div className="space-y-2">
            <div className="font-mono text-sm text-gray-600 mb-4">
              {'{'} 
            </div>
            <div className="ml-2">
              {submission.data && typeof submission.data === 'object' ? 
                Object.entries(submission.data).map(([key, value]) => renderJsonValue(key, value, 1)) :
                <div className="text-gray-500 italic">No JSON data available</div>
              }
            </div>
            <div className="font-mono text-sm text-gray-600">
              {'}'}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CreatorDataModal;
