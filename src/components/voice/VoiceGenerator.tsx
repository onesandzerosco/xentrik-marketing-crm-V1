
import React, { useState } from 'react';
import { Creator } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mic, Play, Copy, Download, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const VOICE_TONES = [
  { id: 'normal', name: 'Normal' },
  { id: 'tired', name: 'Tired' },
  { id: 'sexy', name: 'Sexy' },
  { id: 'excited', name: 'Excited' },
  { id: 'whisper', name: 'Whisper' },
];

const AMBIENCE_OPTIONS = [
  { id: 'none', name: 'None' },
  { id: 'coffee_shop', name: 'Coffee Shop' },
  { id: 'street', name: 'Street Noise' },
  { id: 'nature', name: 'Nature Sounds' },
  { id: 'room', name: 'Room Ambience' },
  { id: 'fan', name: 'Fan Background' },
  { id: 'party', name: 'Party Atmosphere' },
  { id: 'crowd', name: 'Crowd Murmur' },
];

interface VoiceGeneratorProps {
  creators: Creator[];
  toast: any;
}

const VoiceGenerator: React.FC<VoiceGeneratorProps> = ({ creators, toast }) => {
  const [selectedCreator, setSelectedCreator] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [voiceTone, setVoiceTone] = useState<string>('normal');
  const [ambience, setAmbience] = useState<string>('none');
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const handleVoiceGeneration = async () => {
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
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock audio generation with a placeholder base64 audio
      const mockAudioBase64 = "data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";
      
      setGeneratedAudio(mockAudioBase64);
      
      // Store in local cache
      const voiceGenerationCache = JSON.parse(localStorage.getItem('voiceGenerationCache') || '{}');
      const creatorCache = voiceGenerationCache[selectedCreator] || [];
      
      const voiceNote = {
        id: `voice-${Date.now()}`,
        text: text,
        audio: mockAudioBase64,
        settings: {
          voice: voiceTone,
          ambience: ambience,
        },
        createdAt: new Date().toISOString()
      };
      
      creatorCache.unshift(voiceNote);
      if (creatorCache.length > 30) creatorCache.pop();
      
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

  const playAudio = () => {
    if (audioRef.current && generatedAudio) {
      audioRef.current.play();
    }
  };

  const copyAudioToClipboard = () => {
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-1.5">Select Creator</Label>
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
                  <Label className="text-sm font-medium mb-1.5">Voice Tone</Label>
                  <Select 
                    value={voiceTone}
                    onValueChange={setVoiceTone}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select voice tone" />
                    </SelectTrigger>
                    <SelectContent>
                      {VOICE_TONES.map(tone => (
                        <SelectItem key={tone.id} value={tone.id}>
                          {tone.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-1.5">Background Ambience</Label>
                  <Select 
                    value={ambience}
                    onValueChange={setAmbience}
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

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Enter Text</Label>
                  <Textarea 
                    value={text} 
                    onChange={(e) => setText(e.target.value)} 
                    placeholder="Type the text to convert to speech..."
                    className="min-h-[120px] resize-none"
                  />
                </div>

                <Button 
                  onClick={handleVoiceGeneration} 
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
        </div>

        <div>
          {generatedAudio && !isGenerating && (
            <Card className="bg-gradient-to-br from-accent/10 to-accent/5 p-6">
              <h3 className="font-semibold mb-4">Preview Generated Voice Note</h3>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{text}</p>
                
                <div className="flex flex-col gap-3">
                  <Button onClick={playAudio} variant="outline" className="w-full">
                    <Play className="mr-2 h-4 w-4" />
                    Play
                  </Button>
                  <Button onClick={copyAudioToClipboard} variant="outline" className="w-full">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                  <Button onClick={downloadAudio} variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
                
                <audio ref={audioRef} src={generatedAudio} className="hidden" />
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceGenerator;
