import React, { useState, useEffect } from 'react';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mic, Play, Copy, Download, Loader2, Search, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PremiumCard } from '@/components/ui/premium-card';
import { supabase } from '@/integrations/supabase/client';

const VOICE_TONES = [
  { id: 'normal', name: 'Normal' },
  { id: 'tired', name: 'Tired' },
  { id: 'sexy', name: 'Sexy' },
  { id: 'excited', name: 'Excited' },
  { id: 'whisper', name: 'Whisper' },
  { id: 'casual', name: 'Casual' },
  { id: 'seductive', name: 'Seductive' },
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

interface VoiceNote {
  id: string;
  text: string;
  audio: string;
  settings: {
    model: string;
    ambience: string;
    aiTone?: string;
    message?: string;
    quality?: number;
  };
  createdAt: string;
}

interface VoiceGeneratorLayoutProps {
  toast: any;
}

const VoiceGeneratorLayout: React.FC<VoiceGeneratorLayoutProps> = ({ toast }) => {
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedEmotion, setSelectedEmotion] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [aiTone, setAiTone] = useState<string>('normal');
  const [ambience, setAmbience] = useState<string>('none');
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // State for voices from Airtable
  const [voicesByClient, setVoicesByClient] = useState<Record<string, any[]>>({});
  const [isLoadingSources, setIsLoadingSources] = useState<boolean>(true);

  const audioRef = React.useRef<HTMLAudioElement>(null);

  // Fetch voices from Airtable
  useEffect(() => {
    fetchVoicesFromAirtable();
  }, []);

  const fetchVoicesFromAirtable = async () => {
    try {
      setIsLoadingSources(true);
      console.log('Fetching voices from Airtable...');
      
      const { data, error } = await supabase.functions.invoke('airtable-voices');

      if (error) {
        console.error('Error fetching voices from Airtable:', error);
        throw error;
      }

      console.log('Airtable voices response:', data);
      setVoicesByClient(data?.voicesByClient || {});
    } catch (error) {
      console.error('Error fetching voices:', error);
      toast({
        title: "Error",
        description: "Failed to fetch voice models",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSources(false);
    }
  };

  // Get available models (client names)
  const availableModels = Object.keys(voicesByClient);

  // Get available emotions/tones for the selected model
  const availableEmotions = selectedModel ? (voicesByClient[selectedModel] || []).map(voice => voice.tone) : [];

  // Updated voice selection handler
  const handleVoiceChange = (clientName: string) => {
    console.log('Model selected:', clientName);
    setSelectedModel(clientName);
    setSelectedEmotion(''); // Reset emotion when model changes
  };

  useEffect(() => {
    if (selectedModel) {
      setIsLoading(true);
      setTimeout(() => {
        loadVoiceNotes(selectedModel);
        setIsLoading(false);
      }, 500);
    } else {
      setVoiceNotes([]);
    }
  }, [selectedModel]);

  const loadVoiceNotes = (modelId: string) => {
    try {
      const voiceGenerationCache = JSON.parse(localStorage.getItem('voiceGenerationCache') || '{}');
      const modelCache = voiceGenerationCache[modelId] || [];
      setVoiceNotes(modelCache);
    } catch (error) {
      console.error('Error loading voice notes:', error);
      toast({
        title: "Error",
        description: "Failed to load voice notes",
        variant: "destructive",
      });
      setVoiceNotes([]);
    }
  };

  const handleVoiceGeneration = async () => {
    if (!selectedModel) {
      toast({
        title: "Error",
        description: "Please select a voice model",
        variant: "destructive",
      });
      return;
    }

    if (!selectedEmotion) {
      toast({
        title: "Error",
        description: "Please select a tone",
        variant: "destructive",
      });
      return;
    }

    const textToGenerate = message.trim();
    if (!textToGenerate) {
      toast({
        title: "Error",
        description: "Please enter a message to generate",
        variant: "destructive",
      });
      return;
    }

    if (textToGenerate.length > 2500) {
      toast({
        title: "Error",
        description: "Message too long. Maximum 2500 characters allowed.",
        variant: "destructive",
      });
      return;
    }

    // Find the selected voice details
    const selectedVoiceData = voicesByClient[selectedModel]?.find(voice => voice.tone === selectedEmotion);
    if (!selectedVoiceData) {
      toast({
        title: "Error",
        description: "Selected voice configuration not found.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      console.log('Generating voice with ElevenLabs...');
      
      const { data, error } = await supabase.functions.invoke('elevenlabs-generate', {
        body: {
          text: textToGenerate,
          voiceId: selectedVoiceData.elevenId,
          apiKey: selectedVoiceData.apiKey
        }
      });

      if (error) {
        console.error('ElevenLabs generation error:', error);
        throw new Error(error.message || 'Failed to generate voice');
      }

      if (!data || !data.audioContent) {
        throw new Error('No audio data received from voice generation service');
      }

      // Convert base64 to blob URL for playback
      const audioBlob = new Blob([Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      setGeneratedAudio(audioUrl);
      
      // Store in local cache
      const voiceGenerationCache = JSON.parse(localStorage.getItem('voiceGenerationCache') || '{}');
      const modelCache = voiceGenerationCache[selectedModel] || [];
      
      const voiceNote = {
        id: `voice-${Date.now()}`,
        text: textToGenerate,
        audio: audioUrl,
        settings: {
          model: selectedModel,
          ambience: ambience,
          aiTone: aiTone,
          message: message,
        },
        createdAt: new Date().toISOString()
      };
      
      modelCache.unshift(voiceNote);
      if (modelCache.length > 30) modelCache.pop();
      
      voiceGenerationCache[selectedModel] = modelCache;
      localStorage.setItem('voiceGenerationCache', JSON.stringify(voiceGenerationCache));
      
      setVoiceNotes(modelCache);
      
      toast({
        title: "Success",
        description: data.message || "Voice note generated successfully!",
      });
    } catch (error) {
      console.error('Error generating voice:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate voice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const playAudio = (id: string, audioSrc: string) => {
    setPlayingId(id);
    const audio = new Audio(audioSrc);
    audio.addEventListener('ended', () => setPlayingId(null));
    audio.play();
  };

  const copyAudioToClipboard = () => {
    toast({
      title: "Success",
      description: "Audio copied to clipboard!",
    });
  };

  const downloadAudio = (audioSrc: string, text: string) => {
    const link = document.createElement('a');
    link.href = audioSrc;
    link.download = `voice-note-${text.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '-')}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteVoiceNote = (id: string) => {
    try {
      const voiceGenerationCache = JSON.parse(localStorage.getItem('voiceGenerationCache') || '{}');
      const modelCache = voiceGenerationCache[selectedModel] || [];
      const updatedCache = modelCache.filter((note: VoiceNote) => note.id !== id);
      voiceGenerationCache[selectedModel] = updatedCache;
      localStorage.setItem('voiceGenerationCache', JSON.stringify(voiceGenerationCache));
      
      setVoiceNotes(updatedCache);
      
      toast({
        title: "Success",
        description: "Voice note deleted",
      });
    } catch (error) {
      console.error('Error deleting voice note:', error);
      toast({
        title: "Error",
        description: "Failed to delete voice note",
        variant: "destructive",
      });
    }
  };

  const getAiToneName = (aiToneId: string) => {
    const tone = VOICE_TONES.find(t => t.id === aiToneId);
    return tone ? tone.name : aiToneId;
  };

  const getAmbienceName = (ambienceId: string) => {
    const ambience = AMBIENCE_OPTIONS.find(a => a.id === ambienceId);
    return ambience ? ambience.name : ambienceId;
  };

  const filteredNotes = searchTerm 
    ? voiceNotes.filter(note => 
        note.text.toLowerCase().includes(searchTerm.toLowerCase()))
    : voiceNotes;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <>
      <CardHeader className="border-b border-premium-border/30">
        <CardTitle className="text-2xl font-semibold">Voice Generator</CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-8">
          {/* Step 1: Voice Model Selection */}
          <div className="w-full">
            <Label className="text-sm font-medium block">Step 1: Select Voice Model</Label>
            {isLoadingSources ? (
              <div className="flex items-center justify-center h-10 border border-premium-border/30 rounded-md">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2">Loading models...</span>
              </div>
            ) : (
              <Select 
                value={selectedModel} 
                onValueChange={handleVoiceChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a voice model" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map(model => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Step 2: Tone Selection */}
          {selectedModel && (
            <div className="w-full">
              <Label className="text-sm font-medium block">Step 2: Select Tone</Label>
              <Select
                value={selectedEmotion}
                onValueChange={setSelectedEmotion}
                disabled={!selectedModel}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a tone" />
                </SelectTrigger>
                <SelectContent>
                  {availableEmotions.map((tone) => (
                    <SelectItem key={tone} value={tone}>
                      {tone.charAt(0).toUpperCase() + tone.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedModel && (
            <Tabs defaultValue="generate" className="w-full">
              <TabsList className="w-full mb-6">
                <TabsTrigger value="generate" className="flex-1">Generate Voice</TabsTrigger>
                <TabsTrigger value="library" className="flex-1">Voice Library</TabsTrigger>
              </TabsList>

              <TabsContent value="generate" className="space-y-6">
                <div className="space-y-6 w-full">
                  {/* Step 3: AI Tone Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium block">Step 3: AI Tone</Label>
                      <Select 
                        value={aiTone}
                        onValueChange={setAiTone}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select AI tone" />
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

                    <div className="space-y-2">
                      <Label className="text-sm font-medium block">Background Ambience</Label>
                      <Select 
                        value={ambience}
                        onValueChange={setAmbience}
                      >
                        <SelectTrigger>
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
                  </div>

                  {/* Step 4: Message Input */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium block">Step 4: Message for AI Voice</Label>
                    <Input 
                      value={message} 
                      onChange={(e) => setMessage(e.target.value)} 
                      placeholder="Enter the message you want to convert to speech..."
                      className="w-full"
                      maxLength={2500}
                    />
                    <div className="text-xs text-muted-foreground">
                      {message.length}/2500 characters
                    </div>
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

                  {/* Generated Audio Preview */}
                  {generatedAudio && (
                    <PremiumCard className="border-premium-accent/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => playAudio('generated', generatedAudio)}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                            <span className="text-sm text-muted-foreground">Generated Audio</span>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={copyAudioToClipboard}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadAudio(generatedAudio, message)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </PremiumCard>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="library" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search voice notes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                  </div>

                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="ml-2">Loading voice notes...</span>
                    </div>
                  ) : filteredNotes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {selectedModel ? "No voice notes found." : "Select a model to view voice notes."}
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3">
                        {filteredNotes.map((note) => (
                          <PremiumCard key={note.id} className="border-premium-border/30">
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium line-clamp-2">{note.text}</p>
                                    <div className="flex flex-wrap gap-2">
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-premium-muted">
                                        {note.settings.model}
                                      </span>
                                      {note.settings.aiTone && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-premium-muted">
                                          {getAiToneName(note.settings.aiTone)}
                                        </span>
                                      )}
                                      {note.settings.ambience !== 'none' && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-premium-muted">
                                          {getAmbienceName(note.settings.ambience)}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{formatDate(note.createdAt)}</p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => playAudio(note.id, note.audio)}
                                    className="flex items-center space-x-1"
                                  >
                                    <Play className="h-3 w-3" />
                                    <span>Play</span>
                                  </Button>
                                  <div className="flex space-x-1">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={copyAudioToClipboard}
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => downloadAudio(note.audio, note.text)}
                                    >
                                      <Download className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => deleteVoiceNote(note.id)}
                                      className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </PremiumCard>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </CardContent>
    </>
  );
};

export default VoiceGeneratorLayout;