import React from "react";
import { Loader2 } from "lucide-react";
import AdminUsersTable from "./AdminUsersTable";
import CreatorUsersTable from "./CreatorUsersTable";
import OtherRolesUsersTable from "./OtherRolesUsersTable";
import EditUserRolesModal from "../EditUserRolesModal";
import useUserRoles from "./useUserRoles";
import useUserRolesUpdate from "./useUserRolesUpdate";
import { Separator } from "@/components/ui/separator";

const RoleBasedUsersList: React.FC = () => {
  const {
    users,
    loading,
    selectedUser,
    setSelectedUser,
    isModalOpen,
    setIsModalOpen,
    fetchUsers,
    handleEdit
  } = useUserRoles();

  const { handleUpdateUser } = useUserRolesUpdate(fetchUsers);

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand-yellow" />
        <span className="ml-2">Loading users...</span>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {/* Admin Users Table */}
        <div className="rounded-md border p-4">
          <AdminUsersTable 
            users={users} 
            onEditUser={handleEdit} 
          />
        </div>

        <Separator />

        {/* Creator Users Table */}
        <div className="rounded-md border p-4">
          <CreatorUsersTable 
            users={users} 
            onEditUser={handleEdit} 
          />
        </div>

        <Separator />

        {/* Other Roles Users Table */}
        <div className="rounded-md border p-4">
          <OtherRolesUsersTable 
            users={users} 
            onEditUser={handleEdit} 
          />
        </div>
      </div>
      
      <EditUserRolesModal 
        user={selectedUser}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onUpdate={handleUpdateUser}
      />
    </>
  );
};

export default RoleBasedUsersList;
