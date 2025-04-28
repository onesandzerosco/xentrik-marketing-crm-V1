
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import VoiceGenerator from '@/components/voice/VoiceGenerator';
import VoiceLibrary from '@/components/voice/VoiceLibrary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCreators } from '@/context/creator';

const VoiceGeneration: React.FC = () => {
  const { creators } = useCreators();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('generate');
  
  useEffect(() => {
    // Initialize the voice cache in local storage if it doesn't exist
    const voiceCache = localStorage.getItem('voiceGenerationCache');
    if (!voiceCache) {
      localStorage.setItem('voiceGenerationCache', JSON.stringify({}));
    }
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Card className="border border-premium-border shadow-premium-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Voice Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="generate" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 w-[300px] mb-6">
              <TabsTrigger value="generate">Generate Voice</TabsTrigger>
              <TabsTrigger value="library">Voice Library</TabsTrigger>
            </TabsList>
            
            <TabsContent value="generate">
              <VoiceGenerator creators={creators} toast={toast} />
            </TabsContent>
            
            <TabsContent value="library">
              <VoiceLibrary toast={toast} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceGeneration;
