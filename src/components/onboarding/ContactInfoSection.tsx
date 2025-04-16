
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/ui/form";

interface ContactInfoSectionProps {
  telegramUsername: string;
  setTelegramUsername: (username: string) => void;
  whatsappNumber: string;
  setWhatsappNumber: (number: string) => void;
  errors: {
    telegramUsername?: string;
    whatsappNumber?: string;
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
      <div className="space-y-4">
        <div>
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
            <p className="text-red-500 text-sm mt-1">{errors.telegramUsername}</p>
          )}
        </div>
        <div>
          <Label htmlFor="whatsappNumber">
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
            <p className="text-red-500 text-sm mt-1">{errors.whatsappNumber}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactInfoSection;
