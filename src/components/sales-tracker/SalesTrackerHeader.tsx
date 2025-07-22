import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Download } from 'lucide-react';
import { AddModelDialog } from './AddModelDialog';
import { PayChatterDialog } from './PayChatterDialog';
import { useAuth } from '@/context/AuthContext';

export const SalesTrackerHeader: React.FC = () => {
  const [showAddModel, setShowAddModel] = useState(false);
  const [showPayChatter, setShowPayChatter] = useState(false);
  const { userRole, userRoles } = useAuth();

  const isAdmin = userRole === 'Admin' || userRoles?.includes('Admin');

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Sales Tracker</h1>
        <p className="text-muted-foreground mt-1">
          Track weekly earnings by model and day
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() => setShowAddModel(true)}
          className="bg-gradient-premium-yellow hover:bg-gradient-premium-yellow/90 text-black"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Model
        </Button>

        {isAdmin && (
          <Button
            onClick={() => setShowPayChatter(true)}
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10"
          >
            <Download className="h-4 w-4 mr-2" />
            Pay Chatter
          </Button>
        )}
      </div>

      <AddModelDialog 
        open={showAddModel} 
        onOpenChange={setShowAddModel} 
      />
      
      {isAdmin && (
        <PayChatterDialog 
          open={showPayChatter} 
          onOpenChange={setShowPayChatter} 
        />
      )}
    </div>
  );
};