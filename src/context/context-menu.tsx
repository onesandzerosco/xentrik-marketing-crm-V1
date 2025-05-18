
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: (event: React.MouseEvent) => void;
  disabled?: boolean;
}

interface ContextMenuState {
  x: number;
  y: number;
  show: boolean;
  items: MenuItem[];
}

interface ContextMenuContextValue {
  openContextMenu: (options: { event: React.MouseEvent; items: MenuItem[] }) => void;
  closeContextMenu: () => void;
  contextMenu: ContextMenuState;
}

const initialContextMenu: ContextMenuState = {
  x: 0,
  y: 0,
  show: false,
  items: [],
};

const ContextMenuContext = createContext<ContextMenuContextValue | undefined>(undefined);

export const ContextMenuProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(initialContextMenu);

  const openContextMenu = ({ event, items }: { event: React.MouseEvent; items: MenuItem[] }) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      show: true,
      items,
    });
  };

  const closeContextMenu = () => {
    setContextMenu((prev) => ({
      ...prev,
      show: false,
    }));
  };

  React.useEffect(() => {
    const handleClick = () => {
      closeContextMenu();
    };

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <ContextMenuContext.Provider value={{ openContextMenu, closeContextMenu, contextMenu }}>
      {children}
      {contextMenu.show && (
        <div
          className="fixed z-50 bg-background border shadow-md rounded-md py-1 min-w-[160px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.items.map((item, index) => (
            item ? (
              <button
                key={index}
                className="w-full text-left px-3 py-1.5 flex items-center hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={(e) => {
                  item.onClick(e);
                  closeContextMenu();
                }}
                disabled={item.disabled}
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
              </button>
            ) : null
          ))}
        </div>
      )}
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
