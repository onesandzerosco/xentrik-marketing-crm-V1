import React from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';

export const LetsPlayButton: React.FC = () => {
  const handleClick = () => {
    // Open Tasks & Rewards in a new tab using full URL
    window.open(`${window.location.origin}/tasks-rewards`, '_blank');
  };

  return (
    <Button
      variant="ghost"
      onClick={handleClick}
      className={cn(
        "relative px-4 py-2 font-bold text-sm",
        "font-['Press_Start_2P',_monospace]",
        "text-foreground hover:text-primary-foreground",
        "hover:bg-primary",
        "transition-all duration-300",
        // Pulsing glow animation
        "animate-pulse-glow",
        "hover:shadow-[0_0_25px_hsl(var(--primary)/0.8)]",
        "before:absolute before:inset-0 before:rounded-[15px]",
        "before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent",
        "before:translate-x-[-100%] before:opacity-0",
        "hover:before:translate-x-[100%] hover:before:opacity-100",
        "before:transition-all before:duration-700",
        "overflow-hidden",
        "border border-primary/50 hover:border-primary"
      )}
      style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '10px',
        letterSpacing: '0.5px'
      }}
    >
      <span className="relative z-10">Let's Play!</span>
    </Button>
  );
};

export default LetsPlayButton;
