import React from "react";
import { Card, CardContent } from '@/components/ui/card';

interface Chatter {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
}

interface EmployeePayrollTableProps {
  users: Chatter[];
  onSelectChatter: (chatterId: string) => void;
}

const EmployeePayrollTable: React.FC<EmployeePayrollTableProps> = ({ 
  users,
  onSelectChatter
}) => {
  // Group employees by department
  const shift6AM = users.filter(user => user.department === '6AM');
  const shift2PM = users.filter(user => user.department === '2PM');
  const shift10PM = users.filter(user => user.department === '10PM');
  const noShift = users.filter(user => !user.department || !['6AM', '2PM', '10PM'].includes(user.department));

  const renderUserGroup = (title: string, groupUsers: Chatter[]) => {
    if (groupUsers.length === 0) return null;
    
    return (
      <div className="mb-6">
        <h4 className="text-md font-medium mb-3 text-muted-foreground">{title} ({groupUsers.length})</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groupUsers.map((user) => (
            <Card 
              key={user.id} 
              className="bg-secondary/10 border-muted hover:border-primary/50 cursor-pointer transition-colors"
              onClick={() => onSelectChatter(user.id)}
            >
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-1">{user.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
                <div className="flex gap-2">
                  <span className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded">
                    {user.role}
                  </span>
                  {user.department && (
                    <span className="text-xs bg-blue-500/10 text-blue-600 px-2 py-1 rounded">
                      {user.department}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Employee Users ({users.length})</h3>
      {users.length > 0 ? (
        <div className="space-y-6">
          {renderUserGroup('6AM Shift', shift6AM)}
          {renderUserGroup('2PM Shift', shift2PM)}
          {renderUserGroup('10PM Shift', shift10PM)}
          {renderUserGroup('No Shift Assigned', noShift)}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No employee users found
        </div>
      )}
    </div>
  );
};

export default EmployeePayrollTable;