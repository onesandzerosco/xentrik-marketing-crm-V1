
import React, { useState, useRef, useEffect } from 'react';
import { Creator } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Mic, Play, Copy, Download, Loader2 } from 'lucide-react';

interface VoiceGeneratorProps {
  creators: Creator[];
  toast: any;
}

type VoiceSettings = {
  voice: string;
  ambience: string;
  quality: number; // 0-100, higher is worse quality (more realistic)
};

type VoiceProfileMap = {
  [creatorId: string]: VoiceSettings;
};

const ELEVEN_LABS_VOICES = [
  { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria (Female)' },
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger (Male)' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah (Female)' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura (Female)' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie (Male)' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George (Male)' },
];

const AMBIENCE_OPTIONS = [
  { id: 'none', name: 'None' },
  { id: 'coffee_shop', name: 'Coffee Shop' },
  { id: 'street', name: 'Street' },
  { id: 'nature', name: 'Nature' },
  { id: 'party', name: 'Party' },
];

const VoiceGenerator: React.FC<VoiceGeneratorProps> = ({ creators, toast }) => {
  const [selectedCreator, setSelectedCreator] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    voice: ELEVEN_LABS_VOICES[0].id,
    ambience: 'none',
    quality: 20,
  });
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [enableAmbience, setEnableAmbience] = useState<boolean>(false);
  const [voiceProfiles, setVoiceProfiles] = useState<VoiceProfileMap>({});
  const audioRef = useRef<HTMLAudioElement>(null);

  // Load voice profiles from local storage
  useEffect(() => {
    const cachedProfiles = localStorage.getItem('voiceProfiles');
    if (cachedProfiles) {
      setVoiceProfiles(JSON.parse(cachedProfiles));
    }
  }, []);

  // When creator changes, load their voice profile if available
  useEffect(() => {
    if (selectedCreator && voiceProfiles[selectedCreator]) {
      setVoiceSettings(voiceProfiles[selectedCreator]);
    } else if (selectedCreator) {
      // Default settings for new creator
      const newSettings = {
        voice: ELEVEN_LABS_VOICES[0].id,
        ambience: 'none',
        quality: 20,
      };
      setVoiceSettings(newSettings);
      
      // Save the new profile
      const updatedProfiles = { ...voiceProfiles, [selectedCreator]: newSettings };
      setVoiceProfiles(updatedProfiles);
      localStorage.setItem('voiceProfiles', JSON.stringify(updatedProfiles));
    }
  }, [selectedCreator]);

  // Save voice settings whenever they change
  useEffect(() => {
    if (selectedCreator) {
      const updatedProfiles = { ...voiceProfiles, [selectedCreator]: voiceSettings };
      setVoiceProfiles(updatedProfiles);
      localStorage.setItem('voiceProfiles', JSON.stringify(updatedProfiles));
    }
  }, [voiceSettings]);

  const handleVoiceSettingChange = (key: keyof VoiceSettings, value: string | number) => {
    setVoiceSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerateVoice = async () => {
    if (!selectedCreator) {
      toast({
        title: "Error",
        description: "Please select a creator",
        variant: "destructive",
      });
      return;
    }

    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to generate",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // This would connect to an ElevenLabs API or a custom TTS service
      // For now, we'll simulate with a timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock audio generation with a placeholder base64 audio
      // In a real app, this would be the response from ElevenLabs
      const mockAudioBase64 = "data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";
      
      setGeneratedAudio(mockAudioBase64);
      
      // Store in local cache
      const voiceGenerationCache = JSON.parse(localStorage.getItem('voiceGenerationCache') || '{}');
      const creatorCache = voiceGenerationCache[selectedCreator] || [];
      
      // Generate a unique ID for the voice recording
      const timestamp = new Date().toISOString();
      const voiceNote = {
        id: `voice-${Date.now()}`,
        text: text,
        audio: mockAudioBase64,
        settings: voiceSettings,
        createdAt: timestamp
      };
      
      // Add to beginning of array (most recent first)
      creatorCache.unshift(voiceNote);
      
      // Limit to 30 recordings per creator
      if (creatorCache.length > 30) {
        creatorCache.pop();
      }
      
      voiceGenerationCache[selectedCreator] = creatorCache;
      localStorage.setItem('voiceGenerationCache', JSON.stringify(voiceGenerationCache));
      
      toast({
        title: "Success",
        description: "Voice note generated successfully!",
      });
    } catch (error) {
      console.error('Error generating voice:', error);
      toast({
        title: "Error",
        description: "Failed to generate voice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyAudioToClipboard = () => {
    // In a real app, this would use Web Clipboard API to copy the audio file
    // For now, we'll just show a success message
    toast({
      title: "Success",
      description: "Audio copied to clipboard!",
    });
  };

  const downloadAudio = () => {
    if (generatedAudio) {
      const link = document.createElement('a');
      link.href = generatedAudio;
      link.download = `voice-note-${new Date().toISOString()}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const playAudio = () => {
    if (audioRef.current && generatedAudio) {
      audioRef.current.play();
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label>Select Creator</Label>
          <Select 
            value={selectedCreator} 
            onValueChange={setSelectedCreator}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a creator" />
            </SelectTrigger>
            <SelectContent>
              {creators.map(creator => (
                <SelectItem key={creator.id} value={creator.id}>
                  {creator.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCreator && (
          <>
            <div>
              <Label>Voice Profile</Label>
              <Select 
                value={voiceSettings.voice} 
                onValueChange={(value) => handleVoiceSettingChange('voice', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent>
                  {ELEVEN_LABS_VOICES.map(voice => (
                    <SelectItem key={voice.id} value={voice.id}>
                      {voice.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Enable Background Ambience</Label>
              <Switch 
                checked={enableAmbience} 
                onCheckedChange={setEnableAmbience}
              />
            </div>

            {enableAmbience && (
              <div>
                <Label>Background Ambience</Label>
                <Select 
                  value={voiceSettings.ambience} 
                  onValueChange={(value) => handleVoiceSettingChange('ambience', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select ambience" />
                  </SelectTrigger>
                  <SelectContent>
                    {AMBIENCE_OPTIONS.map(option => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <div className="flex justify-between">
                <Label>Audio Quality (Realism)</Label>
                <span className="text-sm text-muted-foreground">{voiceSettings.quality}%</span>
              </div>
              <Slider 
                value={[voiceSettings.quality]} 
                min={0} 
                max={100} 
                step={5}
                className="py-4"
                onValueChange={(values) => handleVoiceSettingChange('quality', values[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Higher Quality</span>
                <span>More Realistic</span>
              </div>
            </div>

            <div>
              <Label>Enter Text</Label>
              <Textarea 
                value={text} 
                onChange={(e) => setText(e.target.value)} 
                placeholder="Type the text to convert to speech..."
                className="min-h-[120px]"
              />
            </div>

            <Button 
              onClick={handleGenerateVoice} 
              className="w-full" 
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" />
                  Generate Voice
                </>
              )}
            </Button>
          </>
        )}
      </div>

      {generatedAudio && !isGenerating && (
        <Card className="mt-6 bg-gradient-to-br from-accent/10 to-accent/5">
          <CardContent className="p-4">
            <div>
              <p className="font-semibold">Generated Voice Note</p>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{text}</p>
              
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <Button onClick={playAudio} variant="outline" className="flex-1">
                  <Play className="mr-2 h-4 w-4" />
                  Play
                </Button>
                <Button onClick={copyAudioToClipboard} variant="outline" className="flex-1">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button onClick={downloadAudio} variant="outline" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
              
              <audio ref={audioRef} src={generatedAudio} className="hidden" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VoiceGenerator;
