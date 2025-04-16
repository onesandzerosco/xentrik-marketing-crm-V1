
import { Creator } from "@/types";
import { useAddCreator } from "./useAddCreator";
import { useUpdateCreator } from "./useUpdateCreator";

export const useCreatorActions = (
  creators: Creator[],
  setCreators: React.Dispatch<React.SetStateAction<Creator[]>>,
  addActivity: (action: string, description: string, creatorId: string) => void
) => {
  const { addCreator } = useAddCreator(creators, setCreators, addActivity);
  const { updateCreator } = useUpdateCreator(creators, setCreators, addActivity);

  return {
    addCreator,
    updateCreator
  };
};

export * from "./useAddCreator";
export * from "./useUpdateCreator";
