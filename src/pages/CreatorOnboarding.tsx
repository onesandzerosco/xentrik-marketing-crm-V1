
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCreators } from "../context/CreatorContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Send, User, Check } from "lucide-react";
import { Gender, Team, CreatorType } from "../types";
import ProfilePicture from "../components/profile/ProfilePicture";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Define validation schema
const onboardingSchema = z.object({
  name: z.string().min(1, "Creator name is required"),
  gender: z.enum(["Male", "Female", "Trans", "AI"]),
  team: z.enum(["A Team", "B Team", "C Team"]),
  creatorType: z.enum(["Real", "AI"]),
  telegramUsername: z.string().min(1, "Telegram username is required"),
  whatsappNumber: z.string().min(1, "WhatsApp number is required"),
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
  const [telegramGroupCreated, setTelegramGroupCreated] = useState(false);
  
  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
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
      // First, create the creator in the database
      const newCreator = {
        name: values.name,
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
      };
      
      // Add the creator to the database
      await addCreator(newCreator);
      
      // Trigger the n8n webhook to create Telegram group and send WhatsApp message
      const webhookUrl = "https://your-n8n-webhook-url.com"; // Replace with actual webhook URL
      
      const webhookPayload = {
        telegram_usernames: [values.telegramUsername],
        whatsapp_numbers: [values.whatsappNumber],
        creator_name: values.name,
        creator_details: {
          ...newCreator,
        }
      };
      
      // Call the webhook
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookPayload),
        mode: "no-cors", // Handle CORS
      });
      
      // Since we're using no-cors, show a successful message
      setTelegramGroupCreated(true);
      
      toast({
        title: "Creator Onboarded Successfully",
        description: "The creator has been added and the Telegram group is being set up.",
        variant: "default",
      });
      
      // Navigate to the creators list after a short delay
      setTimeout(() => {
        navigate("/creators");
      }, 3000);
      
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
    <div className="p-8 w-full max-w-[1400px] mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/creators">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-secondary/20"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to Creators</span>
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold mb-2 text-left">Onboard New Creator</h1>
          <p className="text-muted-foreground">
            Fill in all details to add a new creator and set up communication channels
          </p>
        </div>
      </div>

      {telegramGroupCreated ? (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg p-6 mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-100 dark:bg-green-800/30 p-2 rounded-full">
              <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-semibold">Creator Successfully Onboarded</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            The creator has been added to the system and the Telegram group is being set up. 
            A WhatsApp confirmation will be sent shortly.
          </p>
          <Button 
            variant="outline" 
            onClick={() => navigate("/creators")}
            className="mr-3"
          >
            Return to Creators
          </Button>
          <Button 
            variant="premium"
            onClick={() => {
              setTelegramGroupCreated(false);
              form.reset();
              setProfileImage("");
            }}
          >
            Onboard Another Creator
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-6">
                <div className="bg-card rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-bold mb-4">Profile Picture</h2>
                  <div className="flex justify-center">
                    <ProfilePicture
                      profileImage={profileImage}
                      name={form.watch("name") || "New Creator"}
                      setProfileImage={setProfileImage}
                    />
                  </div>
                </div>
                
                <div className="bg-card rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-bold mb-4">Contact Information</h2>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="telegramUsername"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telegram Username <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="@username" 
                              {...field} 
                            />
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
                          <FormLabel>WhatsApp Number <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="+1234567890" 
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
              
              <div className="md:col-span-2 space-y-6">
                <div className="bg-card rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-bold mb-4">Basic Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                
                <div className="bg-card rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-bold mb-4">Social Media Links</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                
                <div className="bg-card rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-bold mb-4">Additional Notes</h2>
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
            
            <div className="flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/creators")}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="premium"
                className="shadow-premium-yellow hover:shadow-premium-highlight"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Onboard Creator & Create Telegram Group"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default CreatorOnboarding;
