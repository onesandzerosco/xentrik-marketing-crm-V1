
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
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Access Control Panel</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage roles and permissions for team members
          </p>
        </div>
        <div className="flex items-center self-start sm:self-auto">
          <Shield className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-brand-yellow" />
          <span className="text-brand-yellow text-sm sm:text-base">Admin Access</span>
        </div>
      </div>

      {/* Add Permissions Settings */}
      <Card className="mb-4 sm:mb-6">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl">Permissions Settings</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Manage role-based permissions for different modules
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 sm:pt-4">
          <PermissionsSettings />
        </CardContent>
      </Card>

      <Card className="mb-4 sm:mb-6">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 sm:pb-4 space-y-2 sm:space-y-0">
          <div>
            <CardTitle className="text-lg sm:text-xl">User Roles Management</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              View and manage roles for all team members organized by role type
            </CardDescription>
          </div>
          <Users className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground self-start sm:self-auto" />
        </CardHeader>
        <CardContent>
          <RoleBasedUsersList />
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessControlPanel;
