import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Loader2, Upload, X, ChevronLeft, Camera, FileImage, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { QuestAssignment } from '@/hooks/useGamification';
import { useWordOfTheDay } from '@/hooks/useWordOfTheDay';

interface QuestEvidenceUploadProps {
  assignment: QuestAssignment;
  onBack: () => void;
  onSubmitComplete: () => void;
}

const QuestEvidenceUpload: React.FC<QuestEvidenceUploadProps> = ({
  assignment,
  onBack,
  onSubmitComplete,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { dailyWord } = useWordOfTheDay();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const quest = assignment.quest;
  if (!quest) return null;

  // Get progress target from quest (default to 1)
  const progressTarget = quest.progress_target || 1;
  const currentProgress = files.length;
  const progressPercentage = Math.min((currentProgress / progressTarget) * 100, 100);
  const canSubmit = currentProgress >= progressTarget;

  // Check if this is a Word of the Day quest
  const isWordOfDayQuest = quest.title?.toLowerCase().includes('word of the day');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      // Limit total files to progress target
      const remainingSlots = progressTarget - files.length;
      const filesToAdd = newFiles.slice(0, remainingSlots);
      
      if (filesToAdd.length < newFiles.length) {
        toast({
          title: "Upload Limit",
          description: `You can only upload ${progressTarget} screenshot${progressTarget > 1 ? 's' : ''} for this quest.`,
          variant: "default"
        });
      }
      
      setFiles(prev => [...prev, ...filesToAdd]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (): Promise<string[]> => {
    if (!user || files.length === 0) return [];

    const urls: string[] = [];
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${assignment.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('quest-submissions')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Failed to upload ${file.name}`);
      }

      const { data: urlData } = supabase.storage
        .from('quest-submissions')
        .getPublicUrl(fileName);

      urls.push(urlData.publicUrl);
    }
    return urls;
  };

  const handleSubmit = async () => {
    if (!user || !quest) return;
    
    if (!canSubmit) {
      toast({
        title: "Incomplete",
        description: `Please upload ${progressTarget} screenshot${progressTarget > 1 ? 's' : ''} to complete this quest.`,
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload all files
      const attachmentUrls = await uploadFiles();

      // Check if a completion already exists
      const { data: existingCompletion } = await supabase
        .from('gamification_quest_completions')
        .select('id')
        .eq('quest_assignment_id', assignment.id)
        .eq('chatter_id', user.id)
        .maybeSingle();

      if (existingCompletion) {
        throw new Error('You have already submitted this quest');
      }

      // Create the completion record
      const { error: completionError } = await supabase
        .from('gamification_quest_completions')
        .insert({
          quest_assignment_id: assignment.id,
          chatter_id: user.id,
          status: 'pending',
          xp_earned: quest.xp_reward || 0,
          bananas_earned: quest.banana_reward || 0,
          attachments: attachmentUrls
        });

      if (completionError) {
        if (completionError.code === '23505') {
          throw new Error('You have already submitted this quest');
        }
        throw new Error('Failed to submit completion');
      }

      toast({
        title: "Quest Submitted! 🎉",
        description: "Your completion is pending admin review.",
      });

      onSubmitComplete();
    } catch (error: any) {
      console.error('Error submitting quest:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit quest completion",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col" style={{ fontFamily: "'Pixellari', sans-serif" }}>
      {/* Header */}
      <div className="bg-muted/30 p-6 border-b border-border/50">
        <div className="flex items-center gap-2 mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 
            className="text-xl font-bold text-foreground uppercase tracking-wide"
            style={{ fontFamily: "'Macs Minecraft', sans-serif" }}
          >
            Upload Evidence
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Submit proof of completing: <span className="font-medium text-foreground">{quest.game_name || quest.title}</span>
        </p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-5">
        {/* Word of the Day Section */}
        {isWordOfDayQuest && dailyWord && (
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Today's Word</p>
              <p 
                className="text-2xl font-bold text-primary"
                style={{ fontFamily: "'Macs Minecraft', sans-serif" }}
              >
                {dailyWord.word}
              </p>
              {dailyWord.part_of_speech && (
                <p className="text-xs text-muted-foreground italic">({dailyWord.part_of_speech})</p>
              )}
              {dailyWord.definition && (
                <p className="text-sm text-muted-foreground mt-2">{dailyWord.definition}</p>
              )}
            </div>
          </div>
        )}

        {/* Progress Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              <Label 
                className="text-sm font-bold uppercase tracking-wider"
                style={{ fontFamily: "'Macs Minecraft', sans-serif" }}
              >
                Upload Progress
              </Label>
            </div>
            <span 
              className={`text-sm font-bold ${canSubmit ? 'text-green-500' : 'text-primary'}`}
              style={{ fontFamily: "'Macs Minecraft', sans-serif" }}
            >
              {currentProgress} / {progressTarget}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          {canSubmit && (
            <div className="flex items-center gap-2 text-green-500 text-sm">
              <CheckCircle className="h-4 w-4" />
              <span>Ready to submit!</span>
            </div>
          )}
        </div>

        {/* Upload Area */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Upload {progressTarget} screenshot{progressTarget > 1 ? 's' : ''} as proof of completing the quest
          </p>
          
          {!canSubmit && (
            <div className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              <FileImage className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-3">
                {progressTarget - currentProgress} more screenshot{progressTarget - currentProgress > 1 ? 's' : ''} needed
              </p>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="cursor-pointer max-w-xs mx-auto"
              />
            </div>
          )}
          
          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-muted/50 px-3 py-2 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 pb-6 flex items-center justify-end gap-3">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !canSubmit}
          className={`font-bold ${canSubmit ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : 'bg-muted text-muted-foreground'}`}
          style={{ fontFamily: "'Macs Minecraft', sans-serif" }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              {canSubmit ? 'Submit Quest' : `Need ${progressTarget - currentProgress} more`}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default QuestEvidenceUpload;
