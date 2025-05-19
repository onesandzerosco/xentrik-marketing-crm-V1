
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-4">Page not found</p>
        <p className="mb-6 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or the URL might be incorrect: 
          <br />
          <code className="bg-secondary/50 px-1 py-0.5 rounded text-xs block mt-2 mb-4 overflow-auto">
            {location.pathname}
          </code>
          {location.pathname.includes('creator-analytics') && (
            <span className="text-xs block mb-4 text-amber-400">
              Try using /creators/:id/analytics instead of /creator-analytics/:id
            </span>
          )}
        </p>
        <div className="space-x-4">
          <Link to="/">
            <Button variant="default">Go to Home</Button>
          </Link>
          <Link to="/creators">
            <Button variant="outline">View Creators</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
