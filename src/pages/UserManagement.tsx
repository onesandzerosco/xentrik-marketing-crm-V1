
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RoleBasedUsersList from '@/components/admin/users/RoleBasedUsersList';
import InviteCreatorCard from '@/components/admin/creator-invite/InviteCreatorCard';
import PendingLinksCard from '@/components/admin/creator-invite/PendingLinksCard';

const UserManagement: React.FC = () => {
  const { userRole, userRoles } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Check if user has access (Admin only)
  const hasAccess = userRole === 'Admin' || userRoles?.includes('Admin');

  const handleInviteSent = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-4 max-w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage users, roles, and permissions across the platform
          </p>
        </div>
        
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">Users & Roles</TabsTrigger>
            <TabsTrigger value="invites">Creator Invitations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-6">
            <RoleBasedUsersList />
          </TabsContent>
          
          <TabsContent value="invites" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <InviteCreatorCard onInviteSent={handleInviteSent} />
              <PendingLinksCard refreshTrigger={refreshTrigger} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
};

export default UserManagement;
