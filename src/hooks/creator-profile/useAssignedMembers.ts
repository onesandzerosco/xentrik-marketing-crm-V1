
import { useEffect } from "react";
import { Employee } from "@/types/employee";
import { Creator } from "@/types";
import { useCreators } from "@/context/creator";
import { useToast } from "@/hooks/use-toast";

export function useAssignedMembers(
  creator: Creator | null | undefined,
  setAssignedMembers: (members: Employee[]) => void
) {
  const { updateCreator } = useCreators();
  const { toast } = useToast();

  // Load assigned team members
  useEffect(() => {
    if (creator?.assignedTeamMembers && creator.assignedTeamMembers.length > 0) {
      try {
        const savedEmployees = localStorage.getItem('team_employees_data');
        if (savedEmployees) {
          const employeesData = JSON.parse(savedEmployees) as Employee[];
          const members = employeesData.filter(emp => 
            creator.assignedTeamMembers?.includes(emp.id)
          );
          setAssignedMembers(members);
        }
      } catch (error) {
        console.error("Error loading team members:", error);
      }
    } else {
      setAssignedMembers([]);
    }
  }, [creator, setAssignedMembers]);

  const handleAssignTeamMembers = (members: Employee[]) => {
    if (creator) {
      const memberIds = members.map(member => member.id);
      setAssignedMembers(members);
      updateCreator(creator.id, {
        assignedTeamMembers: memberIds
      });
      toast({
        title: "Team Members Assigned",
        description: `${members.length} team members assigned to ${creator.name}`
      });
    }
  };

  return { handleAssignTeamMembers };
}
