
import { Creator, EngagementStats } from "../../types";

export interface CreatorContextType {
  creators: Creator[];
  addCreator: (creator: Omit<Creator, "id">) => void;
  updateCreator: (id: string, updates: Partial<Creator>) => void;
  getCreator: (id: string) => Creator | undefined;
  getCreatorStats: (id: string) => EngagementStats | undefined;
  filterCreators: (filters: { gender?: string[]; team?: string[]; creatorType?: string[] }) => Creator[];
}
