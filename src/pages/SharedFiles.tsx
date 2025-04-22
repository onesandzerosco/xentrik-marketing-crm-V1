
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { useCreators } from '@/context/creator';
import { File } from 'lucide-react';

const SharedFiles = () => {
  const { creators } = useCreators();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold mb-8">Creator Files</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {creators.map((creator) => (
          <Link key={creator.id} to={`/creator-files/${creator.id}`}>
            <Card className="p-6 hover:bg-accent/5 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                {creator.profileImage && (
                  <img 
                    src={creator.profileImage} 
                    alt={creator.name} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <h3 className="text-lg font-medium">{creator.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <File className="h-4 w-4" />
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
