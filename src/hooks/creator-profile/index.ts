
import { useCreators } from "@/context/creator";
import { useCreatorProfileState } from './useCreatorProfileState';
import { useAssignedMembers } from './useAssignedMembers';
import { useProfileSave } from './useProfileSave';
import { Employee } from "@/types/employee";

export const useCreatorProfile = (creatorId: string) => {
  const { getCreator } = useCreators();
  const creator = getCreator(creatorId);
  
  const { state, actions } = useCreatorProfileState(creator);
  const { handleAssignTeamMembers } = useAssignedMembers(creator, actions.setAssignedMembers);
  const { handleSave } = useProfileSave(creator);

  const saveProfile = () => {
    handleSave(state, actions.setNameError);
  };

  return {
    creator,
    formState: state,
    formActions: actions,
    handleSave: saveProfile,
    handleAssignTeamMembers
  };
};

// Export the hook explicitly
export default useCreatorProfile;
