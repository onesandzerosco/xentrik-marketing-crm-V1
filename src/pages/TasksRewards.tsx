import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Gamepad2, Swords, Store } from 'lucide-react';
import GameBoard from '@/components/gamification/GameBoard';
import QuestsPanel from '@/components/gamification/QuestsPanel';
import SupplyDepot from '@/components/gamification/SupplyDepot';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

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

  const activeTab = getActiveTab();

  const navItems = [
    { id: 'game-board', label: 'Game Board', icon: Gamepad2, path: '/tasks-rewards' },
    { id: 'quests', label: 'Quests', icon: Swords, path: '/tasks-rewards/quests' },
    { id: 'supply-depot', label: 'Supply Depot', icon: Store, path: '/tasks-rewards/supply-depot' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'quests':
        return <QuestsPanel isAdmin={isAdmin} />;
      case 'supply-depot':
        return <SupplyDepot isAdmin={isAdmin} />;
      default:
        return <GameBoard isAdmin={isAdmin} />;
    }
  };

  return (
    <div className="flex min-h-screen w-full" style={{ fontFamily: "'SH Pinscher', sans-serif" }}>
      {/* Left Sidebar Navigation */}
      <nav className="w-56 shrink-0 border-r border-border/40 bg-card/50 p-4">
        <div className="mb-6">
          <h1 className="text-xl font-bold bg-gradient-premium-yellow bg-clip-text text-transparent">
            Tasks & Rewards
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Complete quests to earn XP and Bananas
          </p>
        </div>
        
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default TasksRewards;
