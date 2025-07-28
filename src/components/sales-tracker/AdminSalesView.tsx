import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SalesTrackerTable } from './SalesTrackerTable';
import { SalesTrackerHeader } from './SalesTrackerHeader';

interface Chatter {
  id: string;
  name: string;
  email: string;
}

interface AdminSalesViewProps {
  selectedChatterId?: string;
  onSelectChatter: (chatterId: string | null) => void;
}

export const AdminSalesView: React.FC<AdminSalesViewProps> = ({ 
  selectedChatterId, 
  onSelectChatter 
}) => {
  const [chatters, setChatters] = useState<Chatter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchChatters();
  }, []);

  const fetchChatters = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email')
        .or('role.eq.Chatter,roles.cs.{"Chatter"}')
        .order('name');

      if (error) {
        console.error('Error fetching chatters:', error);
        return;
      }

      setChatters(data || []);
    } catch (error) {
      console.error('Error fetching chatters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (selectedChatterId) {
    const selectedChatter = chatters.find(c => c.id === selectedChatterId);
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => onSelectChatter(null)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Chatters
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {selectedChatter?.name}'s Sales Tracker
            </h2>
            <p className="text-muted-foreground">{selectedChatter?.email}</p>
          </div>
        </div>
        
        <SalesTrackerHeader />
        
        <Card className="bg-secondary/10 border-muted">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              Weekly Sales Tracker
              <span className="text-sm text-muted-foreground font-normal">
                (Thursday to Wednesday)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SalesTrackerTable />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SalesTrackerHeader />
      
      <Card className="bg-secondary/10 border-muted">
        <CardHeader>
          <CardTitle className="text-foreground">Select a Chatter</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading chatters...
            </div>
          ) : chatters.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No chatters found.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {chatters.map((chatter) => (
                <Card 
                  key={chatter.id} 
                  className="cursor-pointer hover:bg-secondary/20 transition-colors border-muted"
                  onClick={() => onSelectChatter(chatter.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{chatter.name}</h3>
                        <p className="text-sm text-muted-foreground">{chatter.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};