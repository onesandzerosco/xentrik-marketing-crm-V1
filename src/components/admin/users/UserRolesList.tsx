
import React from "react";
import { Loader2 } from "lucide-react";
import UserRolesTable from "./UserRolesTable";
import EditUserRolesModal from "../EditUserRolesModal";
import useUserRoles from "./useUserRoles";
import useUserRolesUpdate from "./useUserRolesUpdate";

const UserRolesList: React.FC = () => {
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
      <div className="rounded-md border">
        <UserRolesTable 
          users={users} 
          onEditUser={handleEdit} 
        />
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

export default UserRolesList;
