
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ContactInfoSectionProps {
  telegramUsername: string;
  setTelegramUsername: (username: string) => void;
  whatsappNumber: string;
  setWhatsappNumber: (number: string) => void;
  errors: {
    telegramUsername?: string;
    whatsappNumber?: string;
    contactRequired?: string;
  };
}

const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({
  telegramUsername,
  setTelegramUsername,
  whatsappNumber,
  setWhatsappNumber,
  errors = {}
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Contact Information</h2>
      <p className="text-sm text-gray-500 mb-4">At least one contact method (Telegram or WhatsApp) is required</p>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="telegramUsername" className="flex items-center">
            Telegram Username
          </Label>
          <Input 
            id="telegramUsername" 
            placeholder="@username"
            value={telegramUsername}
            onChange={(e) => setTelegramUsername(e.target.value)}
            className={errors.telegramUsername ? "border-red-500" : ""}
          />
          {errors.telegramUsername && (
            <p className="text-red-500 text-sm">{errors.telegramUsername}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="whatsappNumber" className="flex items-center">
            WhatsApp Number
          </Label>
          <Input 
            id="whatsappNumber" 
            placeholder="+1234567890"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            className={errors.whatsappNumber ? "border-red-500" : ""}
          />
          {errors.whatsappNumber && (
            <p className="text-red-500 text-sm">{errors.whatsappNumber}</p>
          )}
        </div>
        
        {errors.contactRequired && (
          <p className="text-red-500 text-sm mt-2">{errors.contactRequired}</p>
        )}
      </div>
    </div>
  );
};

export default ContactInfoSection;
