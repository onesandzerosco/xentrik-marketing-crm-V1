
import React from 'react';
import { Button } from "@/components/ui/button";

export const FilterButtons = () => {
  return (
    <div className="relative mb-6">
      <div 
        className="flex gap-2 overflow-x-auto pb-2"
        style={{ position: 'relative', zIndex: 50 }}
      >
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-white text-black hover:bg-white/90 rounded-full border-none shadow-sm"
          style={{ zIndex: 50 }}
        >
          <span>Type</span>
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-white text-black hover:bg-white/90 rounded-full border-none shadow-sm"
          style={{ zIndex: 50 }}
        >
          <span>Modified</span>
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-white text-black hover:bg-white/90 rounded-full border-none shadow-sm"
          style={{ zIndex: 50 }}
        >
          <span>Location</span>
        </Button>
      </div>
    </div>
  );
};
