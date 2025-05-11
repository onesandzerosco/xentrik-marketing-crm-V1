
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield } from "lucide-react";
import { PERMISSION_ROLES, RolePermission } from "@/utils/permissionModels";
import { usePermissions } from "./usePermissions";

const PermissionsSettings = () => {
  const { permissions, isLoading, savePermissions } = usePermissions();
  const [localPermissions, setLocalPermissions] = useState<RolePermission[]>(permissions);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Update local permissions when permissions are loaded
  React.useEffect(() => {
    if (permissions.length > 0) {
      setLocalPermissions(permissions);
    }
  }, [permissions]);

  // Toggle a permission
  const togglePermission = (rolename: string, action: keyof RolePermission, checked: boolean | "indeterminate") => {
    if (action === 'rolename') return; // Don't allow toggling the role name

    setLocalPermissions(prev => 
      prev.map(p => 
        p.rolename === rolename ? { ...p, [action]: checked === true } : p
      )
    );
  };

  // Save permissions
  const handleSavePermissions = async () => {
    setIsSaving(true);
    try {
      await savePermissions(localPermissions);
      toast({
        title: "Permissions Saved",
        description: "Role permissions have been updated successfully.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error Saving Permissions",
        description: "There was a problem saving the permissions.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2">Loading permissions...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Permissions Settings</CardTitle>
          <CardDescription>
            Manage role-based permissions for the Shared Files module
          </CardDescription>
        </div>
        <Shield className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Role</TableHead>
                <TableHead>Can Upload</TableHead>
                <TableHead>Can Edit Description</TableHead>
                <TableHead>Can Delete</TableHead>
                <TableHead>Can Download</TableHead>
                <TableHead>Can Preview</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PERMISSION_ROLES.map((role) => {
                const rolePermission = localPermissions.find(p => p.rolename === role) || {
                  rolename: role,
                  upload: false,
                  edit: false,
                  delete: false,
                  download: true,
                  preview: true
                };
                
                return (
                  <TableRow key={role}>
                    <TableCell className="font-medium">{role}</TableCell>
                    <TableCell>
                      <Checkbox 
                        checked={rolePermission.upload}
                        onCheckedChange={(checked) => togglePermission(role, "upload", checked)}
                        disabled={role === "Admin"} // Admin always has all permissions
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox 
                        checked={rolePermission.edit}
                        onCheckedChange={(checked) => togglePermission(role, "edit", checked)}
                        disabled={role === "Admin"}
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox 
                        checked={rolePermission.delete}
                        onCheckedChange={(checked) => togglePermission(role, "delete", checked)}
                        disabled={role === "Admin"}
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox 
                        checked={rolePermission.download}
                        onCheckedChange={(checked) => togglePermission(role, "download", checked)}
                        disabled={role === "Admin"}
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox 
                        checked={rolePermission.preview}
                        onCheckedChange={(checked) => togglePermission(role, "preview", checked)}
                        disabled={role === "Admin"}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex justify-end">
          <Button 
            onClick={handleSavePermissions} 
            disabled={isSaving}
            className="bg-brand-yellow text-black hover:bg-brand-yellow/90"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PermissionsSettings;
