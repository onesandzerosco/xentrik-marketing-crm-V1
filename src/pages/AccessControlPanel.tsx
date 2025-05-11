
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
import UserRolesList from "@/components/admin/users/UserRolesList";
import InviteCreatorCard from "@/components/admin/creator-invite/InviteCreatorCard";
import InvitationsList from "@/components/admin/creator-invite/InvitationsList";
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

      {/* Add Permissions Settings */}
      <Card className="mb-6">
        <CardHeader className="pb-0">
          <CardTitle>Permissions Settings</CardTitle>
          <CardDescription>
            Manage role-based permissions for different modules
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <PermissionsSettings />
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>User Roles Management</CardTitle>
            <CardDescription>
              View and manage roles for all team members
            </CardDescription>
          </div>
          <Users className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <UserRolesList />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <InviteCreatorCard />
        <InvitationsList />
      </div>
    </div>
  );
};

export default AccessControlPanel;
