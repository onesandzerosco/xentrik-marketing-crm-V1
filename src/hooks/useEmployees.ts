
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { updateEmployeeProfile, getEmployeeProfile, listEmployees } from '@/services/employeeService';
import { Employee } from '@/types/employee';
import { useToast } from '@/components/ui/use-toast';

export function useEmployees() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: listEmployees,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Employee> }) =>
      updateEmployeeProfile(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: "Success",
        description: "Employee profile updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update employee profile",
        variant: "destructive",
      });
      console.error('Update error:', error);
    },
  });

  return {
    employees,
    isLoading,
    updateEmployee: updateMutation.mutate,
    isUpdating: updateMutation.isPending
  };
}
