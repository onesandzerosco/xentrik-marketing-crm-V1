import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GameBoard from '@/components/gamification/GameBoard';
import QuestsPanel from '@/components/gamification/QuestsPanel';
import SupplyDepot from '@/components/gamification/SupplyDepot';
import { useAuth } from '@/context/AuthContext';

const TasksRewards: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userRole, userRoles } = useAuth();
  
  const isAdmin = userRole === 'Admin' || userRoles?.includes('Admin');
  
  // Determine active tab from URL
  const getActiveTab = () => {
    if (location.pathname.includes('/quests')) return 'quests';
    if (location.pathname.includes('/supply-depot')) return 'supply-depot';
    return 'game-board';
  };

  const handleTabChange = (value: string) => {
    switch (value) {
      case 'quests':
        navigate('/tasks-rewards/quests');
        break;
      case 'supply-depot':
        navigate('/tasks-rewards/supply-depot');
        break;
      default:
        navigate('/tasks-rewards');
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-premium-yellow bg-clip-text text-transparent">
              Tasks & Rewards
            </h1>
            <p className="text-muted-foreground mt-1">
              Complete quests to earn XP and Bananas
            </p>
          </div>
        </div>

        <Tabs value={getActiveTab()} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="game-board" className="text-xs md:text-sm">
              🎮 Game Board
            </TabsTrigger>
            <TabsTrigger value="quests" className="text-xs md:text-sm">
              ⚔️ Quests
            </TabsTrigger>
            <TabsTrigger value="supply-depot" className="text-xs md:text-sm">
              🏪 Supply Depot
            </TabsTrigger>
          </TabsList>

          <TabsContent value="game-board">
            <GameBoard isAdmin={isAdmin} />
          </TabsContent>

          <TabsContent value="quests">
            <QuestsPanel isAdmin={isAdmin} />
          </TabsContent>

          <TabsContent value="supply-depot">
            <SupplyDepot isAdmin={isAdmin} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TasksRewards;
