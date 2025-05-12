
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface OverallProgressIndicatorProps {
  progress: number;
}

const OverallProgressIndicator: React.FC<OverallProgressIndicatorProps> = ({ progress }) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span>Overall progress</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};

export default OverallProgressIndicator;
