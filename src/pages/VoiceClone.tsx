import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Play, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VoiceSource {
  id: string;
  model_name: string;
  emotion: string;
  bucket_key: string;
  created_at: string;
  updated_at: string;
}

interface GroupedSources {
  [modelName: string]: {
    [emotion: string]: VoiceSource[];
  };
}

const VoiceClone: React.FC = () => {
  const { toast } = useToast();
  const [voiceSources, setVoiceSources] = useState<VoiceSource[]>([]);
  const [groupedSources, setGroupedSources] = useState<GroupedSources>({});
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedEmotion, setSelectedEmotion] = useState<string>('');
  const [inputText, setInputText] = useState<string>('');
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSources, setIsLoadingSources] = useState(true);

  const emotions = ['sexual', 'angry', 'excited', 'sweet', 'sad', 'conversational'];

  useEffect(() => {
    fetchVoiceSources();
  }, []);

  const fetchVoiceSources = async () => {
    try {
      setIsLoadingSources(true);
      const { data, error } = await supabase.functions.invoke('voice-sources', {
        method: 'GET'
      });

      if (error) throw error;

      setVoiceSources(data.voiceSources || []);
      setGroupedSources(data.groupedSources || {});
    } catch (error) {
      console.error('Error fetching voice sources:', error);
      toast({
        title: "Error",
        description: "Failed to fetch voice sources",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSources(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedModel || !selectedEmotion || !inputText.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a model, emotion, and enter text to generate",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('voice-generate', {
        body: {
          text: inputText.trim(),
          modelName: selectedModel,
          emotion: selectedEmotion
        }
      });

      if (error) throw error;

      setGeneratedAudio(data.audioUrl);
      toast({
        title: "Success",
        description: "Voice generated successfully!",
      });
    } catch (error) {
      console.error('Error generating voice:', error);
      toast({
        title: "Error",
        description: "Failed to generate voice",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = () => {
    if (generatedAudio) {
      const audio = new Audio(generatedAudio);
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        toast({
          title: "Error",
          description: "Failed to play audio",
          variant: "destructive",
        });
      });
    }
  };

  const downloadAudio = () => {
    if (generatedAudio) {
      const link = document.createElement('a');
      link.href = generatedAudio;
      link.download = `voice_${selectedModel}_${selectedEmotion}_${Date.now()}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const availableModels = Object.keys(groupedSources);
  const availableEmotions = selectedModel ? Object.keys(groupedSources[selectedModel] || {}) : [];

  if (isLoadingSources) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading voice sources...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Voice Cloning</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select
                value={selectedModel}
                onValueChange={(value) => {
                  setSelectedModel(value);
                  setSelectedEmotion('');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emotion">Emotion</Label>
              <Select
                value={selectedEmotion}
                onValueChange={setSelectedEmotion}
                disabled={!selectedModel}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an emotion" />
                </SelectTrigger>
                <SelectContent>
                  {availableEmotions.map((emotion) => (
                    <SelectItem key={emotion} value={emotion}>
                      {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="text">Text to Generate</Label>
            <Textarea
              id="text"
              placeholder="Enter the text you want to convert to speech..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={4}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isLoading || !selectedModel || !selectedEmotion || !inputText.trim()}
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Voice
          </Button>

          {generatedAudio && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Generated Audio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <audio controls className="w-full">
                  <source src={generatedAudio} type="audio/wav" />
                  Your browser does not support the audio element.
                </audio>
                
                <div className="flex gap-2">
                  <Button onClick={playAudio} variant="outline" size="sm">
                    <Play className="mr-2 h-4 w-4" />
                    Play
                  </Button>
                  <Button onClick={downloadAudio} variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceClone;