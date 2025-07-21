import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createMarketingStructureForExistingCreators } from "@/utils/createMarketingStructureForExistingCreators";
import { Loader2, Folder } from "lucide-react";

export const CreateMarketingStructureButton = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleCreateStructure = async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      
      toast({
        title: "Creating marketing structures",
        description: "Processing all existing creators...",
      });

      const result = await createMarketingStructureForExistingCreators();

      if (result.success) {
        toast({
          title: "Marketing structures created",
          description: `Successfully processed ${result.processed} creators, skipped ${result.skipped} (already had categories), failed ${result.failed}`,
        });
      } else {
        toast({
          title: "Error creating marketing structures",
          description: result.error || "Unknown error occurred",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error creating marketing structures:", error);
      toast({
        title: "Error",
        description: "Failed to create marketing structures",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      onClick={handleCreateStructure}
      disabled={isProcessing}
      variant="outline"
      size="sm"
    >
      {isProcessing ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Creating Structures...
        </>
      ) : (
        <>
          <Folder className="h-4 w-4 mr-2" />
          Create Marketing Structures
        </>
      )}
    </Button>
  );
};