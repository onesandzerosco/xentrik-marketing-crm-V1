
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { useCreators } from '@/context/creator';
import { Folder, FileStack } from 'lucide-react';

const SharedFiles = () => {
  const { creators } = useCreators();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold mb-8">Creator Files</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {creators.map((creator) => (
          <Link key={creator.id} to={`/creator-files/${creator.id}`}>
            <Card className="p-6 hover:bg-accent/5 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {creator.profileImage ? (
                    <img 
                      src={creator.profileImage} 
                      alt={creator.name} 
                      className="w-16 h-16 rounded-full object-cover border-2 border-primary/20 group-hover:border-primary/40 transition-all"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-premium-highlight/10 flex items-center justify-center">
                      <Folder className="w-8 h-8 text-primary/60 group-hover:text-primary/80 transition-colors" />
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 bg-primary/20 rounded-full p-1 group-hover:bg-primary/30 transition-all">
                    <FileStack className="w-4 h-4 text-primary/70 group-hover:text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium group-hover:text-primary transition-colors">{creator.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-primary/80 transition-colors">
                    <span>View files</span>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}

        {creators.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-lg text-muted-foreground">No creators found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedFiles;
