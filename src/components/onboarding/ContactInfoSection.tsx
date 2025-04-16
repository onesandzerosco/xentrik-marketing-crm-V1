
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ContactInfoSectionProps {
  telegramUsername: string;
  setTelegramUsername: (username: string) => void;
  whatsappNumber: string;
  setWhatsappNumber: (number: string) => void;
}

const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({
  telegramUsername,
  setTelegramUsername,
  whatsappNumber,
  setWhatsappNumber
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Contact Information</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="telegramUsername">
            Telegram Username
          </Label>
          <Input 
            id="telegramUsername" 
            placeholder="@username"
            value={telegramUsername}
            onChange={(e) => setTelegramUsername(e.target.value)}
          />
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
          />
        </div>
      </div>
    </div>
  );
};

export default ContactInfoSection;
