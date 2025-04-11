
import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LockKeyhole } from 'lucide-react';

const AuthFormHeader: React.FC = () => {
  return (
    <CardHeader className="pb-6">
      <CardTitle className="text-2xl flex items-center gap-2">
        <LockKeyhole className="w-6 h-6 text-brand-yellow" />
        Secure Area
      </CardTitle>
      <CardDescription>
        Enter the password to access creator login details
      </CardDescription>
    </CardHeader>
  );
};

export default AuthFormHeader;
