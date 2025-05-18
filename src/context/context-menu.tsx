
import { createContext, useContext, useState, ReactNode } from 'react';

type MenuItem = {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
};

type ContextMenuPosition = {
  x: number;
  y: number;
};

interface ContextMenuState {
  isOpen: boolean;
  position: ContextMenuPosition;
  items: MenuItem[];
}

interface ContextMenuContextProps {
  menuState: ContextMenuState;
  openContextMenu: (options: { event: React.MouseEvent; items: MenuItem[] }) => void;
  closeContextMenu: () => void;
}

const ContextMenuContext = createContext<ContextMenuContextProps | undefined>(undefined);

export const ContextMenuProvider = ({ children }: { children: ReactNode }) => {
  const [menuState, setMenuState] = useState<ContextMenuState>({
    isOpen: false,
    position: { x: 0, y: 0 },
    items: [],
  });

  const openContextMenu = ({ event, items }: { event: React.MouseEvent; items: MenuItem[] }) => {
    event.preventDefault();
    
    // Calculate position, adjust if too close to window edges
    const x = Math.min(event.clientX, window.innerWidth - 200); // 200px is approximate menu width
    const y = Math.min(event.clientY, window.innerHeight - (items.length * 40)); // 40px per item
    
    setMenuState({
      isOpen: true,
      position: { x, y },
      items: items.filter(Boolean), // Filter out nullish items
    });
  };

  const closeContextMenu = () => {
    setMenuState(prev => ({ ...prev, isOpen: false }));
  };

  // Close menu when clicking outside
  const handleGlobalClick = () => {
    if (menuState.isOpen) {
      closeContextMenu();
    }
  };

  // Render menu if open
  const renderMenu = () => {
    if (!menuState.isOpen) return null;

    return (
      <div
        className="fixed z-50 min-w-[180px] bg-popover border rounded-md shadow-md py-1 text-sm"
        style={{
          top: `${menuState.position.y}px`,
          left: `${menuState.position.x}px`,
        }}
      >
        {menuState.items.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              closeContextMenu();
              item.onClick();
            }}
            className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none"
            disabled={item.disabled}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
    );
  };

  return (
    <ContextMenuContext.Provider value={{ menuState, openContextMenu, closeContextMenu }}>
      {children}
      {renderMenu()}
      {menuState.isOpen && <div className="fixed inset-0 z-40" onClick={handleGlobalClick} />}
    </ContextMenuContext.Provider>
  );
};

export const useContextMenu = () => {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error('useContextMenu must be used within a ContextMenuProvider');
  }
  return context;
};
