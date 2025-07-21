import React, { useState, useEffect } from 'react';
import { Creator } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCreators } from "@/context/creator";

interface EditCreatorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creator: Creator;
}

const EditCreatorModal: React.FC<EditCreatorModalProps> = ({
  open,
  onOpenChange,
  creator
}) => {
  const { updateCreator } = useCreators();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: creator.name,
    modelName: creator.modelName || creator.name,
    email: creator.email || '',
    gender: creator.gender,
    team: creator.team,
    creatorType: creator.creatorType,
    marketingStrategy: creator.marketingStrategy || '',
    telegramUsername: creator.telegramUsername || '',
    whatsappNumber: creator.whatsappNumber || '',
    notes: creator.notes || ''
  });

  // Reset form when creator changes
  useEffect(() => {
    setFormData({
      name: creator.name,
      modelName: creator.modelName || creator.name,
      email: creator.email || '',
      gender: creator.gender,
      team: creator.team,
      creatorType: creator.creatorType,
      marketingStrategy: creator.marketingStrategy || '',
      telegramUsername: creator.telegramUsername || '',
      whatsappNumber: creator.whatsappNumber || '',
      notes: creator.notes || ''
    });
  }, [creator]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Update the creator with the new data
      updateCreator(creator.id, {
        name: formData.name,
        modelName: formData.modelName,
        email: formData.email,
        gender: formData.gender as "Male" | "Female" | "Trans",
        team: formData.team as "A Team" | "B Team" | "C Team",
        creatorType: formData.creatorType as "Real" | "AI",
        marketingStrategy: formData.marketingStrategy,
        telegramUsername: formData.telegramUsername,
        whatsappNumber: formData.whatsappNumber,
        notes: formData.notes
      });

      toast({
        title: "Creator updated successfully",
        description: `${formData.modelName}'s information has been updated.`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error updating creator:", error);
      toast({
        title: "Error updating creator",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Creator Information</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Full name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="modelName">Model Name</Label>
              <Input
                id="modelName"
                value={formData.modelName}
                onChange={(e) => handleInputChange('modelName', e.target.value)}
                placeholder="Model/Stage name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          {/* Category Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleInputChange('gender', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Trans">Trans</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="team">Team</Label>
              <Select
                value={formData.team}
                onValueChange={(value) => handleInputChange('team', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A Team">A Team</SelectItem>
                  <SelectItem value="B Team">B Team</SelectItem>
                  <SelectItem value="C Team">C Team</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="creatorType">Creator Type</Label>
              <Select
                value={formData.creatorType}
                onValueChange={(value) => handleInputChange('creatorType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Real">Real</SelectItem>
                  <SelectItem value="AI">AI</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telegramUsername">Telegram Username</Label>
              <Input
                id="telegramUsername"
                value={formData.telegramUsername}
                onChange={(e) => handleInputChange('telegramUsername', e.target.value)}
                placeholder="@username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
              <Input
                id="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                placeholder="+1234567890"
              />
            </div>
          </div>

          {/* Marketing Strategy */}
          <div className="space-y-2">
            <Label htmlFor="marketingStrategy">Marketing Strategy</Label>
            <Textarea
              id="marketingStrategy"
              value={formData.marketingStrategy}
              onChange={(e) => handleInputChange('marketingStrategy', e.target.value)}
              placeholder="Describe the marketing strategy for this creator..."
              rows={2}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes about this creator..."
              rows={3}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditCreatorModal;