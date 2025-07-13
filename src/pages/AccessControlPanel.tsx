
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
import { Shield, Users } from "lucide-react";
import RoleBasedUsersList from "@/components/admin/users/RoleBasedUsersList";
import PermissionsSettings from "@/components/admin/permissions/PermissionsSettings";

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
    <div className="p-4 md:p-8 max-w-full">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-6">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl md:text-3xl font-bold">Access Control Panel</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage roles and permissions for team members
          </p>
        </div>
        <div className="flex items-center">
          <Shield className="mr-2 h-5 w-5 text-brand-yellow" />
          <span className="text-brand-yellow text-sm md:text-base">Admin Access</span>
        </div>
      </div>

      {/* Add Permissions Settings */}
      <Card className="mb-4 md:mb-6">
        <CardHeader className="pb-0 p-4 md:p-6">
          <CardTitle className="text-lg md:text-xl">Permissions Settings</CardTitle>
          <CardDescription className="text-sm md:text-base">
            Manage role-based permissions for different modules
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 p-4 md:p-6">
          <PermissionsSettings />
        </CardContent>
      </Card>

      <Card className="mb-4 md:mb-6">
        <CardHeader className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0 pb-2 p-4 md:p-6">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg md:text-xl">User Roles Management</CardTitle>
            <CardDescription className="text-sm md:text-base mt-1">
              View and manage roles for all team members organized by role type
            </CardDescription>
          </div>
          <Users className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-2 md:mt-0" />
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <RoleBasedUsersList />
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessControlPanel;
