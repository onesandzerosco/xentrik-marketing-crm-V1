
import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LockKeyhole } from 'lucide-react';

const AuthFormHeader: React.FC = () => {
  return (
    <CardHeader>
      <CardTitle className="text-2xl flex items-center gap-2">
        <LockKeyhole className="w-6 h-6" />
        Secure Area
      </CardTitle>
      <CardDescription>
        Enter the password to access creator login details
      </CardDescription>
    </CardHeader>
  );
};

export default AuthFormHeader;
