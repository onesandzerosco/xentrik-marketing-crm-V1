
import React from 'react';
import { Card } from '@/components/ui/card';
import VoiceGeneratorLayout from '@/components/voice/VoiceGeneratorLayout';
import { useToast } from '@/hooks/use-toast';

const VoiceGeneration: React.FC = () => {
  const { toast } = useToast();
  
  React.useEffect(() => {
    // Initialize the voice cache in local storage if it doesn't exist
    const voiceCache = localStorage.getItem('voiceGenerationCache');
    if (!voiceCache) {
      localStorage.setItem('voiceGenerationCache', JSON.stringify({}));
    }
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Card className="border-premium-border shadow-premium-sm">
        <VoiceGeneratorLayout toast={toast} />
      </Card>
    </div>
  );
};

export default VoiceGeneration;
