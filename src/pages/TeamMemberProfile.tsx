
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import EditEmployeeModal from "../components/employees/EditEmployeeModal";
import { Employee } from "../types/employee";

// Storage key for employees data
const EMPLOYEES_STORAGE_KEY = 'team_employees_data';

const TeamMemberProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const returnToTeam = location.state?.returnToTeam || false;

  // Load employee data on component mount
  useEffect(() => {
    const loadEmployee = () => {
      setLoading(true);
      try {
        const savedEmployees = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
        if (savedEmployees) {
          const employeesData = JSON.parse(savedEmployees) as Employee[];
          const foundEmployee = employeesData.find(emp => emp.id === id);
          
          if (foundEmployee) {
            setEmployee(foundEmployee);
            setShowModal(true);
          } else {
            toast({
              title: "Employee not found",
              description: "Could not find the requested team member",
              variant: "destructive"
            });
            navigate('/team');
          }
        } else {
          toast({
            title: "Data not available",
            description: "Could not load team member data",
            variant: "destructive"
          });
          navigate('/team');
        }
      } catch (error) {
        console.error("Error loading employee data:", error);
        toast({
          title: "Error",
          description: "An error occurred while loading the team member data",
          variant: "destructive"
        });
        navigate('/team');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadEmployee();
    } else {
      navigate('/team');
    }
  }, [id, navigate, toast]);

  // Handle employee update
  const handleUpdateEmployee = (id: string, updates: Partial<Employee>) => {
    try {
      const savedEmployees = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
      if (savedEmployees) {
        const employeesData = JSON.parse(savedEmployees) as Employee[];
        const updatedEmployees = employeesData.map(emp => 
          emp.id === id ? { ...emp, ...updates } : emp
        );
        
        // Save updated employees back to localStorage
        localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(updatedEmployees));
        
        // Update the local state
        setEmployee(prev => prev && { ...prev, ...updates });
        
        toast({
          title: "Changes saved",
          description: "Team member information has been updated successfully"
        });
      }
    } catch (error) {
      console.error("Error updating employee:", error);
      toast({
        title: "Error saving changes",
        description: "An error occurred while saving changes",
        variant: "destructive"
      });
    }
  };

  // Handle going back
  const handleBack = () => {
    if (returnToTeam) {
      navigate('/team');
    } else {
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[300px]">
        <div className="text-center">
          <p className="text-muted-foreground">Loading team member information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="mr-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{employee?.name || "Team Member Profile"}</h1>
          <p className="text-muted-foreground">Edit team member information</p>
        </div>
      </div>

      {employee && (
        <EditEmployeeModal
          open={showModal}
          onOpenChange={(open) => {
            if (!open) handleBack();
            setShowModal(open);
          }}
          employee={employee}
          onUpdateEmployee={handleUpdateEmployee}
          currentUserId={user?.id}
        />
      )}
    </div>
  );
};

export default TeamMemberProfile;
