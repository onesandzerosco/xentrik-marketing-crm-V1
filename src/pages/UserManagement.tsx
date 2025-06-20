
import React from "react";
import { useAuth } from "../context/AuthContext";
import AddTeamMemberForm from "../components/admin/AddTeamMemberForm";
import { Card } from "@/components/ui/card";
import InviteCreatorCard from "@/components/admin/creator-invite/InviteCreatorCard";
import PendingLinksCard from "@/components/admin/creator-invite/PendingLinksCard";

const UserManagement = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  if (!isAdmin) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">User Management</h1>
      <p className="text-muted-foreground mb-6">
        Manage team members and creator onboarding links
      </p>

      {/* Add Team Member - Top Section */}
      <div className="mb-6">
        <Card className="p-6">
          <AddTeamMemberForm />
        </Card>
      </div>

      {/* Onboarding Links - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InviteCreatorCard />
        <PendingLinksCard />
      </div>
    </div>
  );
};

export default UserManagement;
