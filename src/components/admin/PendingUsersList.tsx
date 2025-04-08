
import React from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const PendingUsersList: React.FC = () => {
  const { pendingUsers, approvePendingUser } = useAuth();

  if (pendingUsers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Pending Approvals</CardTitle>
          <CardDescription>Users waiting for approval</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
            <CheckCircle className="w-12 h-12 mb-2" />
            <p>No pending approvals</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Pending Approvals</CardTitle>
            <CardDescription>Users waiting for approval</CardDescription>
          </div>
          <div className="flex items-center bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-full text-sm">
            <AlertTriangle className="w-4 h-4 mr-1" />
            {pendingUsers.length} pending
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingUsers.map((user) => (
            <div key={user.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{user.username}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Requested {formatDistanceToNow(new Date(user.createdAt))} ago
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center text-destructive border-destructive hover:bg-destructive/10"
                    onClick={() => approvePendingUser(user.id, false)}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                    onClick={() => approvePendingUser(user.id, true)}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingUsersList;
