
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import VoiceGenerator from '@/components/voice/VoiceGenerator';
import VoiceLibrary from '@/components/voice/VoiceLibrary';
import { useCreators } from '@/context/creator';

const VoiceGeneration: React.FC = () => {
  const { creators } = useCreators();
  const { toast } = useToast();
  
  useEffect(() => {
    // Initialize the voice cache in local storage if it doesn't exist
    const voiceCache = localStorage.getItem('voiceGenerationCache');
    if (!voiceCache) {
      localStorage.setItem('voiceGenerationCache', JSON.stringify({}));
    }
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      <Card className="border border-premium-border shadow-premium-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Voice Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <VoiceGenerator creators={creators} toast={toast} />
          <VoiceLibrary toast={toast} />
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceGeneration;
