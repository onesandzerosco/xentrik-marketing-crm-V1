
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useSupabaseAuth();
  
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  return (
    <div className="flex h-screen w-full items-center justify-center">
      Loading...
    </div>
  );
};

export default Index;
