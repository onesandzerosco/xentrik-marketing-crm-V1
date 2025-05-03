
import React from "react";
import { useParams } from "react-router-dom";
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
import UserRolesList from "@/components/admin/UserRolesList";

const TeamMemberProfile: React.FC = () => {
  const { userRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

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
          <h1 className="text-3xl font-bold">Team Member Profile</h1>
          <p className="text-muted-foreground">
            View and manage team member details
          </p>
        </div>
        <div className="flex items-center">
          <Shield className="mr-2 h-5 w-5 text-brand-yellow" />
          <span className="text-brand-yellow">Admin Access</span>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>
              View and manage profile for team member {id}
            </CardDescription>
          </div>
          <Users className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {/* User profile content will go here */}
          <p>User ID: {id}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamMemberProfile;
