
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import { CustomSocialLink } from "./CustomSocialLinkItem";

interface AddSocialLinkFormProps {
  onAdd: (newLink: CustomSocialLink) => void;
  onCancel: () => void;
}

const AddSocialLinkForm: React.FC<AddSocialLinkFormProps> = ({
  onAdd,
  onCancel
}) => {
  const [newSocialName, setNewSocialName] = useState("");
  const [newSocialUrl, setNewSocialUrl] = useState("");

  const handleAddLink = () => {
    if (newSocialName.trim() && newSocialUrl.trim()) {
      const newLink: CustomSocialLink = {
        id: uuidv4(),
        name: newSocialName.trim(),
        url: newSocialUrl.trim()
      };
      
      onAdd(newLink);
      setNewSocialName("");
      setNewSocialUrl("");
    }
  };

  return (
    <div className="mt-4 p-4 border border-dashed border-[#252538] rounded-lg">
      <h3 className="text-lg font-semibold mb-3">Add New Social Media</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <Label htmlFor="newSocialName">Platform Name</Label>
          <Input 
            id="newSocialName" 
            placeholder="Platform name"
            value={newSocialName}
            onChange={(e) => setNewSocialName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="newSocialUrl">Profile URL/Username</Label>
          <Input 
            id="newSocialUrl" 
            placeholder="URL or username"
            value={newSocialUrl}
            onChange={(e) => setNewSocialUrl(e.target.value)}
          />
        </div>
      </div>
      <div className="flex space-x-2">
        <Button 
          type="button" 
          variant="default" 
          onClick={handleAddLink}
          disabled={!newSocialName.trim() || !newSocialUrl.trim()}
        >
          Add
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default AddSocialLinkForm;
