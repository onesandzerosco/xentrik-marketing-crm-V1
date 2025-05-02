
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Shield } from "lucide-react";

const AccessControlPanel: React.FC = () => {
  const { userRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if user has admin role
  React.useEffect(() => {
    if (userRole !== "Admin") {
      toast({
        title: "Access Denied",
        description: "You don't have permission to view this page",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  }, [userRole, navigate, toast]);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Access Control Panel</h1>
          <p className="text-muted-foreground">
            Manage roles and permissions for team members
          </p>
        </div>
        <div className="flex items-center">
          <Shield className="mr-2 h-5 w-5 text-brand-yellow" />
          <span className="text-brand-yellow">Admin Access</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Roles Management</CardTitle>
          <CardDescription>
            Assign or remove roles from team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Role management functionality will be added here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessControlPanel;
