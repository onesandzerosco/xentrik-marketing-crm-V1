
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  getLocalStorageSize, 
  formatBytes, 
  getLocalStorageLimit,
  getLocalStorageUsagePercentage,
  getLocalStorageBreakdown
} from "@/utils/storageUtils";

interface StorageUsageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StorageUsageDialog: React.FC<StorageUsageDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const storageSize = getLocalStorageSize();
  const formattedSize = formatBytes(storageSize);
  const storageLimit = getLocalStorageLimit();
  const usagePercentage = getLocalStorageUsagePercentage();
  const breakdown = getLocalStorageBreakdown();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Local Storage Usage</DialogTitle>
          <DialogDescription>
            Information about your browser's localStorage usage for this application.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Used: {formattedSize}</span>
              <span>Limit: {storageLimit}</span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Storage Breakdown</h3>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {breakdown.map((item) => (
                <div key={item.key} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-mono truncate flex-1">{item.key}</span>
                    <span className="text-muted-foreground">{item.formattedSize}</span>
                  </div>
                  <Separator />
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StorageUsageDialog;
