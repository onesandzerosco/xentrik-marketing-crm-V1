
import React from 'react';
import { Card } from '@/components/ui/card';
import VoiceGeneratorLayout from '@/components/voice/VoiceGeneratorLayout';
import { useCreators } from '@/context/creator';
import { useToast } from '@/hooks/use-toast';

const VoiceGeneration: React.FC = () => {
  const { creators } = useCreators();
  const { toast } = useToast();
  
  React.useEffect(() => {
    const voiceCache = localStorage.getItem('voiceGenerationCache');
    if (!voiceCache) {
      localStorage.setItem('voiceGenerationCache', JSON.stringify({}));
    }
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <Card className="border shadow-sm">
        <VoiceGeneratorLayout creators={creators} toast={toast} />
      </Card>
    </div>
  );
};

export default VoiceGeneration;
