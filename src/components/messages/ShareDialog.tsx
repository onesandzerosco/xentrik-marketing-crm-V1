
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

interface ShareDialogProps {
  creatorId: string;
  folderPath: string;
  open: boolean;
  onClose: () => void;
}

// Define a custom interface for the shared folder
interface SharedFolder {
  creator_id: string;
  folder_path: string;
  share_code: string;
  expires_at: string;
  allow_uploads?: boolean;
  allow_downloads?: boolean;
  allow_deletes?: boolean;
}

const ShareDialog: React.FC<ShareDialogProps> = ({ 
  creatorId, 
  folderPath, 
  open, 
  onClose 
}) => {
  const [loading, setLoading] = useState(false);
  const [shareLink, setShareLink] = useState('');

  const generateShareLink = async () => {
    try {
      setLoading(true);
      
      // Generate a random share code
      const shareCode = Math.random().toString(36).substring(2, 15);
      
      // Using insert with typed data instead of relying on table types
      const sharedFolderData: SharedFolder = {
        creator_id: creatorId,
        folder_path: folderPath,
        share_code: shareCode,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        allow_uploads: true,
        allow_downloads: true,
        allow_deletes: false
      };
      
      // Use the generic version of supabase client to avoid TypeScript errors
      const { error } = await (supabase as any)
        .from('shared_folders')
        .insert(sharedFolderData);

      if (error) throw error;

      // Generate the share link
      const shareUrl = `${window.location.origin}/shared/${shareCode}`;
      setShareLink(shareUrl);
    } catch (error) {
      console.error('Error generating share link:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Folder</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!shareLink ? (
            <Button
              onClick={generateShareLink}
              disabled={loading}
              className="w-full"
            >
              Generate Share Link
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input value={shareLink} readOnly />
                <Button onClick={copyToClipboard}>
                  Copy
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                This link will expire in 7 days
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
