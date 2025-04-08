
import React, { useState } from "react";
import { Database } from "lucide-react";
import { 
  getLocalStorageSize, 
  formatBytes, 
  getLocalStorageUsagePercentage
} from "@/utils/storageUtils";
import StorageUsageDialog from "./StorageUsageDialog";

export const StorageUsage: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const storageSize = getLocalStorageSize();
  const formattedSize = formatBytes(storageSize);
  const usagePercentage = getLocalStorageUsagePercentage();

  return (
    <>
      <div 
        className="flex items-center justify-between w-full"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          <span>Storage Usage</span>
        </div>
        <span className="text-xs text-muted-foreground">{formattedSize}</span>
      </div>
      
      <StorageUsageDialog open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
};
