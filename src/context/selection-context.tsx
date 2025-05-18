
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SelectionContextType {
  selectedIds: string[];
  selectItems: (ids: string[]) => void;
  unselectItems: (ids: string[]) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
  selectedCount: number;
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export const SelectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectItems = (ids: string[]) => {
    setSelectedIds((prevIds) => {
      const newIds = [...prevIds];
      ids.forEach((id) => {
        if (!newIds.includes(id)) {
          newIds.push(id);
        }
      });
      return newIds;
    });
  };

  const unselectItems = (ids: string[]) => {
    setSelectedIds((prevIds) => prevIds.filter((id) => !ids.includes(id)));
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prevIds) => {
      if (prevIds.includes(id)) {
        return prevIds.filter((prevId) => prevId !== id);
      } else {
        return [...prevIds, id];
      }
    });
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const isSelected = (id: string) => {
    return selectedIds.includes(id);
  };

  return (
    <SelectionContext.Provider
      value={{
        selectedIds,
        selectItems,
        unselectItems,
        toggleSelection,
        clearSelection,
        isSelected,
        selectedCount: selectedIds.length,
      }}
    >
      {children}
    </SelectionContext.Provider>
  );
};

export const useSelection = () => {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
};
