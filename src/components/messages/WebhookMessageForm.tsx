
import React, { useState } from 'react';
import { useCreators } from '@/context/creator';
import { useTeam } from '@/context/TeamContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface WebhookMessageFormProps {
  onSend: (recipients: { id: string; type: 'creator' | 'team' }[], message: string) => Promise<void>;
}

const WebhookMessageForm: React.FC<WebhookMessageFormProps> = ({ onSend }) => {
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'creators' | 'team'>('creators');
  const [isLoading, setIsLoading] = useState(false);

  const { creators } = useCreators();
  const { teamMembers } = useTeam();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const recipients = selectedIds.map(id => ({
      id,
      type: id.includes('creator-') ? 'creator' as const : 'team' as const
    }));

    try {
      await onSend(recipients, message);
      setMessage('');
      setSelectedIds([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCreators = creators.filter(creator =>
    creator.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTeamMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search recipients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value: 'creators' | 'team') => setActiveTab(value)}>
        <TabsList className="mb-4">
          <TabsTrigger value="creators">Creators</TabsTrigger>
          <TabsTrigger value="team">Team Members</TabsTrigger>
        </TabsList>

        <TabsContent value="creators">
          <ScrollArea className="h-[200px] border rounded-md p-4">
            {filteredCreators.map(creator => (
              <div key={creator.id} className="flex items-center space-x-2 py-2">
                <Checkbox
                  id={`creator-${creator.id}`}
                  checked={selectedIds.includes(`creator-${creator.id}`)}
                  onCheckedChange={() => toggleSelection(`creator-${creator.id}`)}
                />
                <label htmlFor={`creator-${creator.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {creator.name}
                </label>
              </div>
            ))}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="team">
          <ScrollArea className="h-[200px] border rounded-md p-4">
            {filteredTeamMembers.map(member => (
              <div key={member.id} className="flex items-center space-x-2 py-2">
                <Checkbox
                  id={`team-${member.id}`}
                  checked={selectedIds.includes(`team-${member.id}`)}
                  onCheckedChange={() => toggleSelection(`team-${member.id}`)}
                />
                <label htmlFor={`team-${member.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {member.name}
                </label>
              </div>
            ))}
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <Textarea
        placeholder="Type your message here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="min-h-[100px]"
      />

      <Button 
        type="submit" 
        disabled={isLoading || !message.trim() || selectedIds.length === 0}
        className="w-full"
      >
        {isLoading ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
};

export default WebhookMessageForm;
