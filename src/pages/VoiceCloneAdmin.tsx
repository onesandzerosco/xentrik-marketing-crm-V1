import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, Trash2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface VoiceSource {
  id: string;
  model_name: string;
  emotion: string;
  bucket_key: string;
  created_at: string;
  updated_at: string;
}

interface Creator {
  id: string;
  name: string;
  model_name?: string;
}

const VoiceCloneAdmin: React.FC = () => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [voiceSources, setVoiceSources] = useState<VoiceSource[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedEmotion, setSelectedEmotion] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSources, setIsLoadingSources] = useState(true);
  const [isLoadingCreators, setIsLoadingCreators] = useState(true);

  const emotions = ['sexual', 'angry', 'excited', 'sweet', 'sad', 'conversational'];

  useEffect(() => {
    if (isAuthenticated) {
      fetchVoiceSources();
      fetchCreators();
    }
  }, [isAuthenticated]);

  const fetchCreators = async () => {
    try {
      setIsLoadingCreators(true);
      const { data, error } = await supabase
        .from('creators')
        .select('id, name, model_name')
        .order('name');

      if (error) throw error;

      setCreators(data || []);
    } catch (error) {
      console.error('Error fetching creators:', error);
      toast({
        title: "Error",
        description: "Failed to fetch creators",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCreators(false);
    }
  };

  const fetchVoiceSources = async () => {
    try {
      setIsLoadingSources(true);
      const { data, error } = await supabase.functions.invoke('voice-sources', {
        method: 'GET'
      });

      if (error) throw error;

      setVoiceSources(data.voiceSources || []);
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if it's an audio file
      if (!file.type.startsWith('audio/')) {
        toast({
          title: "Invalid File",
          description: "Please select an audio file",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedModel || !selectedEmotion || !selectedFile) {
      toast({
        title: "Missing Information",
        description: "Please select a model, emotion, and file",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('modelName', selectedModel);
      formData.append('emotion', selectedEmotion);

      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`https://rdzwpiokpyssqhnfiqrt.supabase.co/functions/v1/voice-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      
      toast({
        title: "Success",
        description: "Voice uploaded successfully!",
      });

      // Reset form
      setSelectedModel('');
      setSelectedEmotion('');
      setSelectedFile(null);
      const fileInput = document.getElementById('voice-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      // Refresh the list
      fetchVoiceSources();
    } catch (error) {
      console.error('Error uploading voice:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload voice",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this voice source?')) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`https://rdzwpiokpyssqhnfiqrt.supabase.co/functions/v1/voice-sources`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }

      toast({
        title: "Success",
        description: "Voice source deleted successfully!",
      });

      fetchVoiceSources();
    } catch (error) {
      console.error('Error deleting voice source:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete voice source",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="text-center py-8">
            <p>Please log in to access the Voice Clone Admin panel.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Voice Source</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingCreators ? (
                    <SelectItem value="" disabled>Loading...</SelectItem>
                  ) : (
                    creators.map((creator) => (
                      <SelectItem key={creator.id} value={creator.model_name || creator.name}>
                        {creator.model_name || creator.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emotion">Emotion</Label>
              <Select value={selectedEmotion} onValueChange={setSelectedEmotion}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an emotion" />
                </SelectTrigger>
                <SelectContent>
                  {emotions.map((emotion) => (
                    <SelectItem key={emotion} value={emotion}>
                      {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="voice-file">Audio File</Label>
              <Input
                id="voice-file"
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <Button
            onClick={handleUpload}
            disabled={isLoading || !selectedModel || !selectedEmotion || !selectedFile}
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Upload className="mr-2 h-4 w-4" />
            Upload Voice
          </Button>
        </CardContent>
      </Card>

      {/* Voice Sources Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Voice Sources</CardTitle>
          <Button
            onClick={fetchVoiceSources}
            variant="outline"
            size="sm"
            disabled={isLoadingSources}
          >
            {isLoadingSources ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingSources ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading voice sources...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead>Emotion</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {voiceSources.map((source) => (
                  <TableRow key={source.id}>
                    <TableCell className="font-medium">{source.model_name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {source.emotion.charAt(0).toUpperCase() + source.emotion.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {source.bucket_key.split('/').pop()}
                    </TableCell>
                    <TableCell>{formatDate(source.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        onClick={() => handleDelete(source.id)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {voiceSources.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No voice sources found. Upload your first voice to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceCloneAdmin;