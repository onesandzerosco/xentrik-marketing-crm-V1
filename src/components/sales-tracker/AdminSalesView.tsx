import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Users } from 'lucide-react';
import { SalesTrackerTable } from './SalesTrackerTable';
import { WeekNavigator } from './WeekNavigator';
import { GoogleSheetsLinkManager } from './GoogleSheetsLinkManager';
import { supabase } from '@/integrations/supabase/client';

interface Chatter {
  id: string;
  name: string;
  email: string;
}

interface AdminSalesViewProps {
  selectedChatterId: string | null;
  onSelectChatter: (chatterId: string | null) => void;
}

export const AdminSalesView: React.FC<AdminSalesViewProps> = ({
  selectedChatterId,
  onSelectChatter,
}) => {
  const [chatters, setChatters] = useState<Chatter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  useEffect(() => {
    fetchChatters();
  }, []);

  const fetchChatters = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email')
        .or('role.eq.Chatter,roles.cs.{Chatter}');

      if (error) throw error;

      setChatters(data || []);
    } catch (error) {
      console.error('Error fetching chatters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedChatter = chatters.find(c => c.id === selectedChatterId);

  if (selectedChatterId && selectedChatter) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => onSelectChatter(null)}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Chatters
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{selectedChatter.name}</h1>
            <p className="text-muted-foreground">{selectedChatter.email}</p>
          </div>
        </div>

        <Card className="bg-secondary/10 border-muted">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground flex items-center gap-2">
                Weekly Sales Tracker
                <span className="text-sm text-muted-foreground font-normal">
                  (Thursday to Wednesday)
                </span>
              </CardTitle>
              <WeekNavigator selectedWeek={selectedWeek} onWeekChange={setSelectedWeek} />
            </div>
            <GoogleSheetsLinkManager chatterId={selectedChatterId} isAdminView />
          </CardHeader>
          <CardContent>
            <SalesTrackerTable chatterId={selectedChatterId} selectedWeek={selectedWeek} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Sales Tracker - Select Chatter</h1>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-secondary/10 border-muted animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : chatters.length === 0 ? (
        <Card className="bg-secondary/10 border-muted">
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No chatters found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chatters.map((chatter) => (
            <Card 
              key={chatter.id} 
              className="bg-secondary/10 border-muted hover:border-primary/50 cursor-pointer transition-colors"
              onClick={() => onSelectChatter(chatter.id)}
            >
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-1">{chatter.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{chatter.email}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};