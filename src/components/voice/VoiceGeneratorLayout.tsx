
import React, { useState } from 'react';
import { Creator } from '@/types';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mic, Play, Copy, Download, Loader2, History, Settings, Search, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PremiumCard } from '@/components/ui/premium-card';

// Voice tone options
const VOICE_TONES = [
  { id: 'normal', name: 'Normal' },
  { id: 'tired', name: 'Tired' },
  { id: 'sexy', name: 'Sexy' },
  { id: 'excited', name: 'Excited' },
  { id: 'whisper', name: 'Whisper' },
];

// Ambience options
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
    voice: string;
    ambience: string;
    quality?: number;
  };
  createdAt: string;
}

interface VoiceGeneratorLayoutProps {
  creators: Creator[];
  toast: any;
}

const VoiceGeneratorLayout: React.FC<VoiceGeneratorLayoutProps> = ({ creators, toast }) => {
  // State for creator selection
  const [selectedCreator, setSelectedCreator] = useState<string>('');
  
  // State for voice generation
  const [text, setText] = useState<string>('');
  const [voiceTone, setVoiceTone] = useState<string>('normal');
  const [ambience, setAmbience] = useState<string>('none');
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  
  // State for voice library
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const audioRef = React.useRef<HTMLAudioElement>(null);
  
  // Load voice notes when creator changes
  React.useEffect(() => {
    if (selectedCreator) {
      setIsLoading(true);
      setTimeout(() => {
        loadVoiceNotes(selectedCreator);
        setIsLoading(false);
      }, 500);
    } else {
      setVoiceNotes([]);
    }
  }, [selectedCreator]);
  
  const loadVoiceNotes = (creatorId: string) => {
    try {
      const voiceGenerationCache = JSON.parse(localStorage.getItem('voiceGenerationCache') || '{}');
      const creatorCache = voiceGenerationCache[creatorId] || [];
      setVoiceNotes(creatorCache);
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
      
      // Mock audio generation with a short placeholder base64 audio instead of the very long one
      const mockAudioBase64 = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAASAAAeMwAUFBQUFCIiIiIiIjAwMDAwMD4+Pj4+PkxMTExMTFpaWlpaWmhoaGhoaHZ2dnZ2doSEhISEhJKSkpKSkqCgoKCgoK6urq6urrKysr";
      
      // Generate a unique ID
      const noteId = `note_${Date.now()}`;
      
      // Create new voice note object
      const newVoiceNote = {
        id: noteId,
        text,
        audio: mockAudioBase64,
        settings: {
          voice: voiceTone,
          ambience,
          quality: 1
        },
        createdAt: new Date().toISOString()
      };
      
      // Update local storage cache
      try {
        const voiceGenerationCache = JSON.parse(localStorage.getItem('voiceGenerationCache') || '{}');
        const creatorNotes = voiceGenerationCache[selectedCreator] || [];
        voiceGenerationCache[selectedCreator] = [newVoiceNote, ...creatorNotes];
        localStorage.setItem('voiceGenerationCache', JSON.stringify(voiceGenerationCache));
      } catch (error) {
        console.error('Error saving to cache:', error);
      }
      
      // Set generated audio and update local state
      setGeneratedAudio(mockAudioBase64);
      setVoiceNotes(prev => [newVoiceNote, ...prev]);
      
      toast({
        title: "Success",
        description: "Voice generated successfully",
      });
      
    } catch (error) {
      console.error('Error generating voice:', error);
      toast({
        title: "Error",
        description: "Failed to generate voice",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayVoice = (audio: string, id: string | null = null) => {
    if (audioRef.current) {
      audioRef.current.src = audio;
      audioRef.current.play().catch(err => {
        console.error('Error playing audio:', err);
        toast({
          title: "Error",
          description: "Failed to play audio",
          variant: "destructive",
        });
      });
      
      if (id) {
        setPlayingId(id);
        
        audioRef.current.onended = () => {
          setPlayingId(null);
        };
      }
    }
  };

  const handleDeleteVoice = (id: string) => {
    if (!selectedCreator || !id) return;
    
    try {
      const voiceGenerationCache = JSON.parse(localStorage.getItem('voiceGenerationCache') || '{}');
      const creatorNotes = voiceGenerationCache[selectedCreator] || [];
      voiceGenerationCache[selectedCreator] = creatorNotes.filter(note => note.id !== id);
      localStorage.setItem('voiceGenerationCache', JSON.stringify(voiceGenerationCache));
      
      // Update state
      setVoiceNotes(prev => prev.filter(note => note.id !== id));
      
      if (playingId === id && audioRef.current) {
        audioRef.current.pause();
        setPlayingId(null);
      }
      
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

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "Success",
          description: "Text copied to clipboard",
        });
      },
      (err) => {
        console.error('Could not copy text: ', err);
        toast({
          title: "Error",
          description: "Failed to copy text",
          variant: "destructive",
        });
      }
    );
  };

  const handleDownloadAudio = (audio: string, text: string) => {
    try {
      // Convert base64 to blob
      const byteString = atob(audio.split(',')[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      
      const blob = new Blob([ab], { type: 'audio/mp3' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `voice_${Date.now()}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Audio downloaded successfully",
      });
    } catch (error) {
      console.error('Error downloading audio:', error);
      toast({
        title: "Error",
        description: "Failed to download audio",
        variant: "destructive",
      });
    }
  };

  const filteredVoiceNotes = searchTerm.trim() !== '' 
    ? voiceNotes.filter(note => note.text.toLowerCase().includes(searchTerm.toLowerCase()))
    : voiceNotes;

  return (
    <div className="space-y-6">
      <audio ref={audioRef} className="hidden" />
      
      <Tabs defaultValue="generate" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardTitle className="text-2xl font-bold">Voice Generator</CardTitle>
            <p className="text-muted-foreground mt-1">Generate voice clips for your selected creator</p>
          </div>
          <TabsList>
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              <span>Generate</span>
            </TabsTrigger>
            <TabsTrigger value="library" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span>Voice Library</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Generate Tab */}
        <TabsContent value="generate" className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div>
                <Label htmlFor="text" className="text-base font-medium mb-2 block">Enter Text</Label>
                <Textarea 
                  id="text"
                  placeholder="Type or paste text here to generate voice..."
                  className="min-h-[200px] text-base"
                  value={text}
                  onChange={e => setText(e.target.value)}
                />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>{text.length} characters</span>
                  <span>~{Math.ceil(text.length / 20)} seconds</span>
                </div>
              </div>
              
              <div className="flex gap-4 flex-wrap">
                <Button
                  onClick={handleVoiceGeneration}
                  disabled={isGenerating || !selectedCreator || !text.trim()}
                  className="flex-1"
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
                
                {generatedAudio && (
                  <Button 
                    variant="outline" 
                    onClick={() => handlePlayVoice(generatedAudio)}
                    className="flex-1"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Play Preview
                  </Button>
                )}
              </div>
              
              {generatedAudio && (
                <div className="flex gap-2 mt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCopyText(text)}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Text
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownloadAudio(generatedAudio, text)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Audio
                  </Button>
                </div>
              )}
            </div>
            
            <div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="creator" className="text-base font-medium mb-2 block">Select Creator</Label>
                  <Select 
                    value={selectedCreator} 
                    onValueChange={setSelectedCreator}
                  >
                    <SelectTrigger className="w-full" id="creator">
                      <SelectValue placeholder="Select a creator" />
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
                
                <div>
                  <Label htmlFor="voice" className="text-base font-medium mb-2 block">Voice Tone</Label>
                  <Select value={voiceTone} onValueChange={setVoiceTone}>
                    <SelectTrigger className="w-full" id="voice">
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
                  <Label htmlFor="ambience" className="text-base font-medium mb-2 block">Ambience</Label>
                  <Select value={ambience} onValueChange={setAmbience}>
                    <SelectTrigger className="w-full" id="ambience">
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
                
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground mb-2">Current Usage</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-secondary/30 rounded-lg p-3">
                      <p className="text-sm font-medium">Characters</p>
                      <p className="text-2xl font-bold">2,450</p>
                      <p className="text-xs text-muted-foreground">of 100,000</p>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-3">
                      <p className="text-sm font-medium">Audio Time</p>
                      <p className="text-2xl font-bold">3:25</p>
                      <p className="text-xs text-muted-foreground">minutes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Library Tab */}
        <TabsContent value="library" className="w-full">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="search" className="text-base font-medium mb-2 block">Search Voice Library</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by text content..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="library-creator" className="text-base font-medium mb-2 block">Filter by Creator</Label>
                <Select 
                  value={selectedCreator} 
                  onValueChange={setSelectedCreator}
                >
                  <SelectTrigger className="w-[200px]" id="library-creator">
                    <SelectValue placeholder="Select a creator" />
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
            </div>
            
            {!selectedCreator ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">Please select a creator to view their voice library</p>
              </div>
            ) : isLoading ? (
              <div className="py-12 text-center">
                <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">Loading voice library...</p>
              </div>
            ) : filteredVoiceNotes.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">No voice notes found. Generate some voice notes first!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVoiceNotes.map(note => (
                  <div key={note.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                          <span>·</span>
                          <span>{VOICE_TONES.find(t => t.id === note.settings.voice)?.name || note.settings.voice}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDeleteVoice(note.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="h-[80px] overflow-y-auto text-sm">
                      {note.text}
                    </div>
                    
                    <div className="flex justify-between gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handlePlayVoice(note.audio, note.id)}
                        disabled={playingId === note.id}
                      >
                        {playingId === note.id ? (
                          <>
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            Playing...
                          </>
                        ) : (
                          <>
                            <Play className="mr-1 h-3 w-3" />
                            Play
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleCopyText(note.text)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDownloadAudio(note.audio, note.text)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings" className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Voice Generation Settings</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quality">Voice Quality</Label>
                      <Select defaultValue="standard">
                        <SelectTrigger>
                          <SelectValue placeholder="Select quality" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="premium">Premium (Uses more credits)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="language">Default Language</Label>
                      <Select defaultValue="en-US">
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en-US">English (US)</SelectItem>
                          <SelectItem value="en-GB">English (UK)</SelectItem>
                          <SelectItem value="es-ES">Spanish</SelectItem>
                          <SelectItem value="fr-FR">French</SelectItem>
                          <SelectItem value="de-DE">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Storage Settings</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Voice recordings are currently stored in your browser's local storage.
                </p>
                <Button variant="outline" size="sm">
                  Clear Voice Library Cache
                </Button>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">API Integration</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect to an external API for more advanced voice generation capabilities.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="api-key">API Key</Label>
                    <Input id="api-key" type="password" placeholder="Enter API key" />
                  </div>
                  <div className="flex items-end">
                    <Button className="mb-0.5">Connect API</Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <PremiumCard
                title="Upgrade to Premium"
                description="Get access to higher quality voices, longer audio clips, and more features."
                features={[
                  "High-quality voice generation",
                  "Remove character limits",
                  "Access to all ambience options",
                  "Priority processing",
                  "API access for integration"
                ]}
                price="$9.99"
                period="month"
                buttonText="Upgrade Now"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VoiceGeneratorLayout;
