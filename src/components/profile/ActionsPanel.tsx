
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Tag } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ActionsPanelProps {
  isInactive: boolean;
  setIsInactive: (value: boolean) => void;
  needsReview: boolean;
  setNeedsReview: (value: boolean) => void;
}

const ActionsPanel: React.FC<ActionsPanelProps> = ({
  isInactive,
  setIsInactive,
  needsReview,
  setNeedsReview,
}) => {
  const { toast } = useToast();

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4">Actions</h2>
      <div className="space-y-4">
        <Button className="w-full">
          <MessageSquare className="h-4 w-4 mr-2" />
          Create Telegram Chat
        </Button>
        
        <Button variant="outline" className="w-full">
          Send Manager Note
        </Button>
        
        <Separator />
        
        <div className="flex items-center justify-between py-2">
          <div className="space-y-1">
            <Label htmlFor="inactive" className="font-medium">Tag as Inactive</Label>
            <p className="text-xs text-muted-foreground">Temporarily pause</p>
          </div>
          <Switch id="inactive" checked={isInactive} onCheckedChange={setIsInactive} />
        </div>
        
        <div className="flex items-center justify-between py-2">
          <div className="space-y-1">
            <Label htmlFor="review" className="font-medium">Manual Review Done</Label>
            <p className="text-xs text-muted-foreground">
              {needsReview ? "Mark profile as reviewed" : "Mark profile as needs review"}
            </p>
          </div>
          <Switch 
            id="review" 
            checked={!needsReview} 
            onCheckedChange={(checked) => setNeedsReview(!checked)} 
          />
        </div>
        
        <Separator />
        
        <Button variant="destructive" className="w-full" onClick={() => {
          toast({
            title: "Feature not implemented",
            description: "This feature is not yet available"
          });
        }}>
          <Tag className="h-4 w-4 mr-2" />
          Remove Creator
        </Button>
      </div>
    </div>
  );
};

export default ActionsPanel;
