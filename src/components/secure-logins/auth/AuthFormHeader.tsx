
import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LockKeyhole } from 'lucide-react';

const AuthFormHeader: React.FC = () => {
  return (
    <CardHeader className="pb-6">
      <CardTitle className="text-2xl flex items-center gap-2 transition-all duration-300 hover:opacity-90">
        <LockKeyhole className="w-6 h-6 text-brand-yellow transition-all duration-300" />
        Secure Area
      </CardTitle>
      <CardDescription className="transition-all duration-300 hover:opacity-90">
        Enter the password to access creator login details
      </CardDescription>
    </CardHeader>
  );
};

export default AuthFormHeader;
