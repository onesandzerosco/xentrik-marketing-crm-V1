
import React from "react";
import { useAuth } from "../context/AuthContext";
import AddTeamMemberForm from "../components/admin/AddTeamMemberForm";
import { Card } from "@/components/ui/card";
import InviteCreatorCard from "@/components/admin/creator-invite/InviteCreatorCard";
import PendingLinksCard from "@/components/admin/creator-invite/PendingLinksCard";
import UserRolesList from "@/components/admin/users/UserRolesList";

const UserManagement = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  if (!isAdmin) {
    return (
      <div className="p-4 md:p-8">
        <h1 className="text-xl md:text-2xl font-bold mb-4">Access Denied</h1>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-full">
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">User Management</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Manage team members and creator onboarding links
        </p>
      </div>

      {/* Add Team Member - Top Section */}
      <div className="mb-4 md:mb-6">
        <Card className="p-4 md:p-6">
          <AddTeamMemberForm />
        </Card>
      </div>

      {/* Employee Management Table */}
      <div className="mb-4 md:mb-6">
        <Card className="p-4 md:p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Employee Management</h2>
            <p className="text-sm text-muted-foreground">
              Manage team member roles, suspend accounts, or permanently delete users
            </p>
          </div>
          <UserRolesList />
        </Card>
      </div>

      {/* Onboarding Links - Side by Side on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <InviteCreatorCard />
        <PendingLinksCard />
      </div>
    </div>
  );
};

export default UserManagement;
