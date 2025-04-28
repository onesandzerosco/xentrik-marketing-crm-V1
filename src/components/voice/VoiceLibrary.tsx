
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Play, Copy, Download, Trash2, Loader2 } from 'lucide-react';
import { useCreators } from '@/context/creator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface VoiceNote {
  id: string;
  text: string;
  audio: string;
  settings: {
    voice: string;
    ambience: string;
    quality: number;
  };
  createdAt: string;
}

interface VoiceLibraryProps {
  toast: any;
}

const VoiceLibrary: React.FC<VoiceLibraryProps> = ({ toast }) => {
  const { creators } = useCreators();
  const [selectedCreator, setSelectedCreator] = useState<string>('');
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load voice notes when creator changes
  useEffect(() => {
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

  const playAudio = (id: string, audioSrc: string) => {
    setPlayingId(id);
    const audio = new Audio(audioSrc);
    audio.addEventListener('ended', () => setPlayingId(null));
    audio.play();
  };

  const copyAudioToClipboard = (audioSrc: string) => {
    // In a real app, this would use Web Clipboard API
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
      const creatorCache = voiceGenerationCache[selectedCreator] || [];
      const updatedCache = creatorCache.filter((note: VoiceNote) => note.id !== id);
      voiceGenerationCache[selectedCreator] = updatedCache;
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
          <div>
            <Label>Search Voice Notes</Label>
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by content..."
            />
          </div>
        )}
      </div>

      {selectedCreator && (
        <div className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredNotes.length > 0 ? (
            <ScrollArea className="max-h-[500px] pr-4">
              <div className="space-y-4">
                {filteredNotes.map((note) => (
                  <Card key={note.id} className="p-4 transition-all hover:shadow-md">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <p className="text-xs text-muted-foreground">
                          {formatDate(note.createdAt)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Quality: {note.settings.quality}%
                        </p>
                      </div>
                      <p className="line-clamp-2">{note.text}</p>
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => playAudio(note.id, note.audio)}
                          className="flex-1"
                        >
                          {playingId === note.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4 mr-1" />
                          )}
                          Play
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyAudioToClipboard(note.audio)}
                          className="flex-1"
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => downloadAudio(note.audio, note.text)}
                          className="flex-1"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteVoiceNote(note.id)}
                          className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No voice notes found for this creator.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Generate some voice notes in the "Generate Voice" tab.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceLibrary;
