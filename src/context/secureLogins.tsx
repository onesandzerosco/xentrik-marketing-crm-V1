
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SecureLogin {
  id: string;
  service: string;
  username: string;
  password: string;
  creatorId: string;
}

interface SecureLoginsContextType {
  secureLogins: SecureLogin[];
  setSecureLogins: React.Dispatch<React.SetStateAction<SecureLogin[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const SecureLoginsContext = createContext<SecureLoginsContextType | undefined>(undefined);

export const SecureLoginsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [secureLogins, setSecureLogins] = useState<SecureLogin[]>([]);
  const [loading, setLoading] = useState(true);

  return (
    <SecureLoginsContext.Provider value={{ secureLogins, setSecureLogins, loading, setLoading }}>
      {children}
    </SecureLoginsContext.Provider>
  );
};

export const useSecureLogins = () => {
  const context = useContext(SecureLoginsContext);
  if (context === undefined) {
    throw new Error('useSecureLogins must be used within a SecureLoginsProvider');
  }
  return context;
};
