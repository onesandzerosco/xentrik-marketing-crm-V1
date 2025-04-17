
import { useState, useEffect } from "react";
import { useCreators } from "@/context/creator";
import { useToast } from "@/hooks/use-toast";
import { Employee } from "@/types/employee";
import { CustomSocialLink } from "@/components/onboarding/social/CustomSocialLinkItem";
import { Gender, Team, CreatorType } from "@/types";

export function useCreatorProfile(creatorId: string) {
  const { getCreator, updateCreator } = useCreators();
  const { toast } = useToast();
  const creator = getCreator(creatorId);
  
  const [name, setName] = useState(creator?.name || "");
  const [nameError, setNameError] = useState<string | null>(null);
  const [gender, setGender] = useState<Gender>(creator?.gender || "Male");
  const [team, setTeam] = useState<Team>(creator?.team || "A Team");
  const [creatorType, setCreatorType] = useState<CreatorType>(creator?.creatorType || "Real");
  const [profileImage, setProfileImage] = useState(creator?.profileImage || "");
  const [telegramUsername, setTelegramUsername] = useState(creator?.telegramUsername || "");
  const [whatsappNumber, setWhatsappNumber] = useState(creator?.whatsappNumber || "");
  const [instagram, setInstagram] = useState(creator?.socialLinks.instagram || "");
  const [tiktok, setTiktok] = useState(creator?.socialLinks.tiktok || "");
  const [twitter, setTwitter] = useState(creator?.socialLinks.twitter || "");
  const [reddit, setReddit] = useState(creator?.socialLinks.reddit || "");
  const [chaturbate, setChaturbate] = useState(creator?.socialLinks.chaturbate || "");
  const [youtube, setYoutube] = useState(creator?.socialLinks.youtube || "");
  const [customSocialLinks, setCustomSocialLinks] = useState<CustomSocialLink[]>([]);
  const [notes, setNotes] = useState(creator?.notes || "");
  const [needsReview, setNeedsReview] = useState(creator?.needsReview || false);
  const [assignedMembers, setAssignedMembers] = useState<Employee[]>([]);
  const [errors, setErrors] = useState({});

  // Load assigned team members
  useEffect(() => {
    if (creator?.assignedTeamMembers && creator.assignedTeamMembers.length > 0) {
      try {
        const savedEmployees = localStorage.getItem('team_employees_data');
        if (savedEmployees) {
          const employeesData = JSON.parse(savedEmployees) as Employee[];
          const members = employeesData.filter(emp => 
            creator.assignedTeamMembers?.includes(emp.id)
          );
          setAssignedMembers(members);
        }
      } catch (error) {
        console.error("Error loading team members:", error);
      }
    } else {
      setAssignedMembers([]);
    }
  }, [creator]);

  // Extract custom social links
  useEffect(() => {
    if (creator?.socialLinks) {
      const standardLinks = ['instagram', 'tiktok', 'twitter', 'reddit', 'chaturbate', 'youtube'];
      const custom: CustomSocialLink[] = [];
      
      Object.entries(creator.socialLinks).forEach(([key, value]) => {
        if (!standardLinks.includes(key) && value) {
          custom.push({
            id: key,
            name: key.charAt(0).toUpperCase() + key.slice(1),
            url: value
          });
        }
      });
      
      setCustomSocialLinks(custom);
    }
  }, [creator]);

  const handleSave = () => {
    setNameError(null);
    if (!name.trim()) {
      setNameError("Creator name is required");
      setTimeout(() => setNameError(null), 3000);
      toast({
        title: "Error",
        description: "Creator name is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!creator) return;
    
    const socialLinksObj: Record<string, string | undefined> = {
      instagram: instagram || undefined,
      tiktok: tiktok || undefined,
      twitter: twitter || undefined,
      reddit: reddit || undefined,
      chaturbate: chaturbate || undefined,
      youtube: youtube || undefined,
    };
    
    // Add custom social links
    customSocialLinks.forEach(link => {
      if (link.url) {
        socialLinksObj[link.name.toLowerCase()] = link.url;
      }
    });
    
    const assignedTeamMembers = assignedMembers.map(member => member.id);
    
    updateCreator(creator.id, {
      name,
      gender,
      team,
      creatorType,
      profileImage,
      telegramUsername: telegramUsername || undefined,
      whatsappNumber: whatsappNumber || undefined,
      socialLinks: socialLinksObj,
      tags: [gender, team, creatorType],
      needsReview,
      assignedTeamMembers,
      notes
    });
    
    toast({
      title: "Profile Updated",
      description: "Creator profile has been successfully updated"
    });
  };

  const handleAssignTeamMembers = (members: Employee[]) => {
    setAssignedMembers(members);
    if (creator) {
      const memberIds = members.map(member => member.id);
      updateCreator(creator.id, {
        assignedTeamMembers: memberIds
      });
      toast({
        title: "Team Members Assigned",
        description: `${members.length} team members assigned to ${creator.name}`
      });
    }
  };

  return {
    creator,
    formState: {
      name,
      nameError,
      gender,
      team,
      creatorType,
      profileImage,
      telegramUsername,
      whatsappNumber,
      instagram,
      tiktok,
      twitter,
      reddit,
      chaturbate,
      youtube,
      customSocialLinks,
      notes,
      needsReview,
      assignedMembers,
      errors
    },
    formActions: {
      setName,
      setNameError,
      setGender,
      setTeam,
      setCreatorType,
      setProfileImage,
      setTelegramUsername,
      setWhatsappNumber,
      setInstagram,
      setTiktok,
      setTwitter,
      setReddit,
      setChaturbate,
      setYoutube,
      setCustomSocialLinks,
      setNotes,
      setNeedsReview,
      setAssignedMembers
    },
    handleSave,
    handleAssignTeamMembers
  };
}
