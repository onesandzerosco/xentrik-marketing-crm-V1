
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';

interface AttachmentsSectionProps {
  attachments: File[];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAttachment: (index: number) => void;
}

const AttachmentsSection: React.FC<AttachmentsSectionProps> = ({
  attachments,
  onFileChange,
  onRemoveAttachment
}) => {
  return (
    <div>
      <Label htmlFor="attachments">Attachments (Optional)</Label>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Input
            id="attachments"
            type="file"
            multiple
            onChange={onFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('attachments')?.click()}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Add Files
          </Button>
        </div>
        
        {attachments.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {attachments.length} file(s) selected:
            </p>
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                <span className="text-sm">{file.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveAttachment(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttachmentsSection;
