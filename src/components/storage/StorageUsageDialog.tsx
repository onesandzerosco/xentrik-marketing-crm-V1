import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Database, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { 
  getLocalStorageSize, 
  formatBytes, 
  getLocalStorageUsagePercentage,
  cleanLocalStorage
} from "@/utils/storageUtils";
import { useToast } from "@/hooks/use-toast";

interface StorageUsageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StorageUsageDialog: React.FC<StorageUsageDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();
  const storageSize = getLocalStorageSize();
  const formattedSize = formatBytes(storageSize);
  const usagePercentage = getLocalStorageUsagePercentage();
  
  // Items to keep when cleaning storage
  const essentialItems = ['auth_token', 'user_preferences'];
  
  const handleClearStorage = () => {
    cleanLocalStorage(essentialItems);
    
    toast({
      title: "Storage cleared",
      description: "Non-essential storage data has been cleared.",
    });
    
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <span>Storage Usage</span>
          </DialogTitle>
          <DialogDescription>
            View and manage your application's local storage usage.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Current Usage</span>
            <span className="text-sm text-muted-foreground">{formattedSize}</span>
          </div>
          
          <Progress value={usagePercentage} className="h-2" />
          
          <div className="text-sm text-muted-foreground mt-1">
            {usagePercentage}% of estimated browser storage limit used
          </div>
          
          <div className="rounded-md bg-muted p-4 mt-4">
            <div className="flex gap-2 items-start">
              <div className="mt-0.5">
                <Database className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <h4 className="text-sm font-medium">Storage Information</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Your browser allows around 5MB of local storage per domain. 
                  Clearing storage may log you out of the application and reset some preferences.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleClearStorage}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear Storage
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StorageUsageDialog;
