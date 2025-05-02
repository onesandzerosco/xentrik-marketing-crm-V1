
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Employee } from "@/types/employee";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { mockEmployees } from "@/data/mockEmployees"; // Using mock data for initial development

const UserRolesList: React.FC = () => {
  const [users, setUsers] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // In a real app, fetch actual users from Supabase
    // This would use supabase client to fetch users with their roles
    const fetchUsers = async () => {
      try {
        // Using mock data for development
        setUsers(mockEmployees);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand-yellow" />
        <span className="ml-2">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">User</TableHead>
            <TableHead className="w-[150px]">Email</TableHead>
            <TableHead className="w-[100px]">Primary Role</TableHead>
            <TableHead>Additional Roles</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {user.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt={user.name} 
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <span>{user.name}</span>
                </div>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge className="bg-brand-yellow text-black">
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {user.permissions?.map((permission, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  className={
                    user.status === "Active" ? "bg-green-500" : 
                    user.status === "Paused" ? "bg-amber-500" : 
                    "bg-red-500"
                  }
                >
                  {user.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserRolesList;
