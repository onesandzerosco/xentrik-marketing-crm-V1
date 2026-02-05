import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Gamepad2, Swords, Store, Settings } from 'lucide-react';
import GameBoard from '@/components/gamification/GameBoard';
import QuestsPanel from '@/components/gamification/QuestsPanel';
import ChatterQuestsPage from '@/components/gamification/ChatterQuestsPage';
import SupplyDepot from '@/components/gamification/SupplyDepot';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

const LOGO_PATH = 'xentrik-logo.png';
const BUCKET_NAME = 'logos';

const TasksRewards: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userRole, userRoles, isLoading } = useSupabaseAuth();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  
  // Wait for auth to finish loading before determining admin status
  const isAdmin = !isLoading && (userRole === 'Admin' || userRoles?.includes('Admin'));

  useEffect(() => {
    const loadLogo = async () => {
      try {
        const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(LOGO_PATH);
        if (publicUrl) {
          setLogoUrl(publicUrl);
        }
      } catch (error) {
        console.error('Error loading logo:', error);
      }
    };
    loadLogo();
  }, []);
  
  // Determine active tab from URL
  const getActiveTab = () => {
    if (location.pathname.includes('/control-panel')) return 'control-panel';
    if (location.pathname.includes('/quests')) return 'quests';
    if (location.pathname.includes('/supply-depot')) return 'supply-depot';
    return 'game-board';
  };

  const activeTab = getActiveTab();

  const navItems = [
    { id: 'game-board', label: 'Game Board', icon: Gamepad2, path: '/tasks-rewards', adminOnly: false },
    { id: 'quests', label: 'Quests', icon: Swords, path: '/tasks-rewards/quests', adminOnly: false },
    { id: 'supply-depot', label: 'Supply Depot', icon: Store, path: '/tasks-rewards/supply-depot', adminOnly: false },
    { id: 'control-panel', label: 'Control Panel', icon: Settings, path: '/tasks-rewards/control-panel', adminOnly: true },
  ];

  // Filter nav items based on admin status
  const visibleNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

  const renderContent = () => {
    switch (activeTab) {
      case 'control-panel':
        return <QuestsPanel isAdmin={isAdmin} />;
      case 'quests':
        return <ChatterQuestsPage />;
      case 'supply-depot':
        return <SupplyDepot isAdmin={isAdmin} />;
      default:
        return <GameBoard isAdmin={isAdmin} />;
    }
  };

  return (
    <div className="flex min-h-screen w-full" style={{ fontFamily: "'Pixellari', sans-serif" }}>
      {/* Left Sidebar Navigation - Fixed position */}
      <nav className="shrink-0 border-r-2 border-primary/30 bg-card/80 p-6 flex flex-col sticky top-0 h-screen overflow-y-auto" style={{ width: '20rem' }}>
        <div className="mb-6 flex items-center justify-center">
          {logoUrl && (
            <img
              src={logoUrl}
              alt="Xentrik Marketing"
              className="h-12 w-auto object-contain"
            />
          )}
        </div>
        
        <div className="space-y-2 flex-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg border-2 border-primary"
                    : "text-muted-foreground hover:bg-primary/20 hover:text-foreground border-2 border-transparent"
                )}
                style={{ fontFamily: "'Macs Minecraft', sans-serif" }}
              >
                <Icon className="h-6 w-6 shrink-0" />
                <span className="text-base">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content Area - Reduced padding, maximize space */}
      <main className="flex-1 overflow-y-auto p-3 md:p-4 bg-background">
        <div className="w-full max-w-none">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default TasksRewards;
