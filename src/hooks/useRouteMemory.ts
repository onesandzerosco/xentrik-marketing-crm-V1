
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useRouteMemory = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Store the current route path in localStorage for later restoration
    // Only store the path if it's a dashboard-related route
    if (location.pathname.startsWith('/dashboard') || 
        location.pathname.startsWith('/user-management') || 
        location.pathname.startsWith('/access-control') || 
        location.pathname.startsWith('/creators') || 
        location.pathname.startsWith('/onboarding')) {
      localStorage.setItem('lastVisitedRoute', location.pathname);
    }
  }, [location.pathname]);
};

export default useRouteMemory;
