import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCreators } from "../context/CreatorContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Send } from "lucide-react";
import { Gender, Team, CreatorType } from "../types";
import ProfilePicture from "../components/profile/ProfilePicture";
import TeamMemberSelectionDialog from "../components/creators/TeamMemberSelectionDialog";

const onboardingSchema = z.object({
  name: z.string().min(1, "Creator name is required"),
  email: z.string().email("Invalid email address"),
  gender: z.enum(["Male", "Female", "Trans", "AI"]),
  team: z.enum(["A Team", "B Team", "C Team"]),
  creatorType: z.enum(["Real", "AI"]),
  telegramUsername: z.string().optional(),
  whatsappNumber: z.string().optional(),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
  twitter: z.string().optional(),
  reddit: z.string().optional(),
  chaturbate: z.string().optional(),
  notes: z.string().optional(),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

const CreatorOnboarding = () => {
  const navigate = useNavigate();
  const { addCreator } = useCreators();
  const { toast } = useToast();
  const [profileImage, setProfileImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTeamMemberDialog, setShowTeamMemberDialog] = useState(false);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  
  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      email: "",
      gender: "Male",
      team: "A Team",
      creatorType: "Real",
      telegramUsername: "",
      whatsappNumber: "",
      instagram: "",
      tiktok: "",
      twitter: "",
      reddit: "",
      chaturbate: "",
      notes: "",
    },
  });

  const handleSubmit = async (values: OnboardingFormValues) => {
    setIsSubmitting(true);
    
    try {
      const newCreator = {
        name: values.name,
        email: values.email,
        profileImage,
        gender: values.gender as Gender,
        team: values.team as Team,
        creatorType: values.creatorType as CreatorType,
        socialLinks: {
          instagram: values.instagram || undefined,
          tiktok: values.tiktok || undefined,
          twitter: values.twitter || undefined,
          reddit: values.reddit || undefined,
          chaturbate: values.chaturbate || undefined,
        },
        tags: [values.gender, values.team, values.creatorType],
        needsReview: true,
        telegramUsername: values.telegramUsername,
        whatsappNumber: values.whatsappNumber,
        notes: values.notes,
      };
      
      const creatorId = await addCreator(newCreator);
      
      toast({
        title: "Creator Onboarded Successfully",
        description: selectedTeamMembers.length > 0 
          ? "The creator has been added and the Telegram group is being set up."
          : "The creator profile has been created successfully.",
        variant: "default",
      });
      
      setTimeout(() => {
        navigate("/creators");
      }, 2000);
      
    } catch (error) {
      console.error("Error during onboarding:", error);
      toast({
        title: "Onboarding Failed",
        description: "There was an error during the onboarding process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141428] text-foreground">
      <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/creators">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to Creators</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Onboard New Creator</h1>
            <p className="text-muted-foreground">Fill in the details to add a new creator to the platform</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <div className="bg-[#1a1a33] text-card-foreground rounded-lg border border-[#252538] shadow-sm p-6">
                    <ProfilePicture
                      profileImage={profileImage}
                      name={form.watch("name") || "New Creator"}
                      setProfileImage={setProfileImage}
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-8">
                <div className="bg-[#1a1a33] text-card-foreground rounded-lg border border-[#252538] shadow-sm p-6 space-y-6">
                  <h2 className="text-lg font-semibold">Basic Information</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Enter creator name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Enter creator email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender <span className="text-red-500">*</span></FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Trans">Trans</SelectItem>
                              <SelectItem value="AI">AI</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="team"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Team <span className="text-red-500">*</span></FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select team" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="A Team">A Team</SelectItem>
                              <SelectItem value="B Team">B Team</SelectItem>
                              <SelectItem value="C Team">C Team</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="creatorType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Creator Type <span className="text-red-500">*</span></FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select creator type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Real">Real</SelectItem>
                              <SelectItem value="AI">AI</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="bg-[#1a1a33] text-card-foreground rounded-lg border border-[#252538] shadow-sm p-6 space-y-6">
                  <h2 className="text-lg font-semibold">Contact Information</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="telegramUsername"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telegram Username</FormLabel>
                          <FormControl>
                            <Input placeholder="@username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="whatsappNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>WhatsApp Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+1234567890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="bg-[#1a1a33] text-card-foreground rounded-lg border border-[#252538] shadow-sm p-6 space-y-6">
                  <h2 className="text-lg font-semibold">Social Media Links</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="instagram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instagram</FormLabel>
                          <FormControl>
                            <Input placeholder="Instagram username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tiktok"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>TikTok</FormLabel>
                          <FormControl>
                            <Input placeholder="TikTok username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="twitter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Twitter</FormLabel>
                          <FormControl>
                            <Input placeholder="Twitter username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="reddit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reddit</FormLabel>
                          <FormControl>
                            <Input placeholder="Reddit username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="chaturbate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chaturbate</FormLabel>
                          <FormControl>
                            <Input placeholder="Chaturbate username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="bg-[#1a1a33] text-card-foreground rounded-lg border border-[#252538] shadow-sm p-6 space-y-6">
                  <h2 className="text-lg font-semibold">Additional Notes</h2>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea 
                            placeholder="Add any additional notes about this creator" 
                            className="min-h-[120px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/creators")}
              >
                Cancel
              </Button>
              
              <Button 
                type="submit"
                onClick={() => form.handleSubmit(handleSubmit)()}
                variant="outline"
              >
                <Save className="h-4 w-4 mr-2" />
                Create Profile Only
              </Button>
              
              <Button 
                type="button"
                onClick={() => setShowTeamMemberDialog(true)}
                variant="default"
                className="bg-brand-yellow text-black hover:bg-brand-highlight"
                disabled={!form.watch("telegramUsername")}
              >
                <Send className="h-4 w-4 mr-2" />
                Create & Setup Telegram
              </Button>
            </div>
          </form>
        </Form>

        <TeamMemberSelectionDialog
          open={showTeamMemberDialog}
          onOpenChange={setShowTeamMemberDialog}
          onConfirm={(members) => {
            setSelectedTeamMembers(members);
            form.handleSubmit(handleSubmit)();
          }}
          teamMembers={[]}
        />
      </div>
    </div>
  );
};

export default CreatorOnboarding;
