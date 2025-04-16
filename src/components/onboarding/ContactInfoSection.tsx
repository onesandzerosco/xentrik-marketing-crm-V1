
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CountryCodeSelector from "@/components/ui/country-code-selector";

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
  // Extract country code and number
  const [countryCode, number] = whatsappNumber.includes(' ') 
    ? whatsappNumber.split(' ', 2) 
    : ["+1", whatsappNumber.replace(/^\+/, '')];

  const handleCountryCodeChange = (code: string) => {
    const currentNumber = whatsappNumber.includes(' ') 
      ? whatsappNumber.split(' ')[1] 
      : whatsappNumber.replace(/^\+\d+\s?/, '');
    setWhatsappNumber(`${code} ${currentNumber}`);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyNumbers = e.target.value.replace(/[^0-9]/g, '');
    const currentCode = whatsappNumber.includes(' ') 
      ? whatsappNumber.split(' ')[0] 
      : "+1";
    setWhatsappNumber(`${currentCode} ${onlyNumbers}`);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Contact Information</h2>
      <p className="text-sm text-gray-500 mb-4">At least one contact method (Telegram or WhatsApp) is required</p>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="telegramUsername" className="flex items-center">
            Telegram Username
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
            <Input 
              id="telegramUsername" 
              placeholder="username"
              className={`pl-7 ${errors.telegramUsername ? "border-red-500" : ""}`}
              value={telegramUsername.startsWith('@') ? telegramUsername.substring(1) : telegramUsername}
              onChange={(e) => {
                const value = e.target.value;
                setTelegramUsername(value.startsWith('@') ? value : '@' + value);
              }}
            />
          </div>
          {errors.telegramUsername && (
            <p className="text-red-500 text-sm">{errors.telegramUsername}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="whatsappNumber" className="flex items-center">
            WhatsApp Number
          </Label>
          <div className="flex gap-2">
            <CountryCodeSelector
              value={countryCode || "+1"}
              onChange={handleCountryCodeChange}
            />
            <Input 
              id="whatsappNumber" 
              placeholder="123456789"
              className={`flex-1 ${errors.whatsappNumber ? "border-red-500" : ""}`}
              value={number}
              onChange={handleNumberChange}
            />
          </div>
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
