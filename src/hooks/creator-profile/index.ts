
import { useCreatorProfileState } from './useCreatorProfileState';
import { useProfileSave } from './useProfileSave';
import { useAssignedMembers } from './useAssignedMembers';

export const useCreatorProfile = () => {
  const profileState = useCreatorProfileState();
  const { saveProfile, isLoading: isSaving } = useProfileSave();
  const { assignedMembers, isLoading: membersLoading } = useAssignedMembers();

  return {
    ...profileState,
    saveProfile,
    isSaving,
    assignedMembers,
    membersLoading
  };
};

// Export the hook explicitly
export default useCreatorProfile;
