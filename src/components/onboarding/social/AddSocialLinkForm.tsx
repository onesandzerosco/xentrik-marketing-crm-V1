
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import { CustomSocialLink } from "./CustomSocialLinkItem";

interface AddSocialLinkFormProps {
  onAdd: (link: CustomSocialLink) => void;
  onCancel: () => void;
}

const AddSocialLinkForm: React.FC<AddSocialLinkFormProps> = ({ onAdd, onCancel }) => {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [errors, setErrors] = useState({ name: "", url: "" });

  const validateForm = () => {
    const newErrors = { name: "", url: "" };
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = "Platform name is required";
      isValid = false;
    }

    if (!url.trim()) {
      newErrors.url = "URL is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const newLink: CustomSocialLink = {
      id: uuidv4(),
      name: name.trim(),
      url: url.trim()
    };
    
    onAdd(newLink);
    setName("");
    setUrl("");
  };

  return (
    <form onSubmit={handleSubmit} className="border border-gray-200 dark:border-gray-700 rounded-md p-4 mt-4">
      <h3 className="text-lg font-semibold mb-3">Add New Social Media</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="platformName">
            Platform Name
          </Label>
          <Input 
            id="platformName" 
            value={name}
            placeholder="e.g. Facebook, LinkedIn"
            onChange={(e) => setName(e.target.value)}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="profileUrl">
            Profile URL
          </Label>
          <Input 
            id="profileUrl" 
            value={url}
            placeholder="https://..."
            onChange={(e) => setUrl(e.target.value)}
            className={errors.url ? "border-red-500" : ""}
          />
          {errors.url && (
            <p className="text-red-500 text-sm">{errors.url}</p>
          )}
          <p className="text-xs text-gray-500">Enter the full URL to the profile (including https://)</p>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 mt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit">
          Add
        </Button>
      </div>
    </form>
  );
};

export default AddSocialLinkForm;
