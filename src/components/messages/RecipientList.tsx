
import React from 'react';
import { Search, Filter, User } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import TagFilter from '@/components/TagFilter';

interface Recipient {
  id: string;
  name: string;
  profileImage?: string;
  role?: string;
  type: 'creator' | 'employee';
}

interface RecipientListProps {
  recipients: Recipient[];
  selectedRecipientId: string;
  onSelectRecipient: (id: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

const RecipientList: React.FC<RecipientListProps> = ({
  recipients,
  selectedRecipientId,
  onSelectRecipient,
  searchTerm,
  onSearchChange,
  selectedTags,
  onTagsChange
}) => {
  // Filter tags for recipient types
  const recipientTypeTags = ["Team", "Creator"];

  return (
    <Card className="md:col-span-1 flex flex-col h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Recipients</CardTitle>
        <CardDescription>
          Select a team member or creator to send a WhatsApp message
        </CardDescription>
        
        {/* Filter by type */}
        <div className="mt-2 mb-4">
          <div className="flex items-center mb-2">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm font-medium">Filter by type</span>
          </div>
          <TagFilter 
            tags={recipientTypeTags}
            selectedTags={selectedTags}
            onChange={onTagsChange}
            type="team"
          />
        </div>
        
        {/* Search input */}
        <div className="relative mt-2">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search recipients..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden px-2 pb-0">
        <ScrollArea className="h-[calc(100vh-350px)]">
          <div className="space-y-1 px-1 py-2">
            {recipients.map((recipient) => (
              <button
                key={recipient.id}
                className={`w-full text-left px-3 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                  selectedRecipientId === recipient.id 
                    ? 'bg-accent text-accent-foreground' 
                    : 'hover:bg-muted'
                }`}
                onClick={() => onSelectRecipient(recipient.id)}
              >
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={recipient.profileImage || ""} alt={recipient.name} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-medium truncate">{recipient.name}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <p className="text-sm text-muted-foreground truncate">
                      {recipient.role || "Team Member"}
                    </p>
                    <Badge variant="outline" className="ml-1 text-xs">
                      {recipient.type === 'creator' ? 'Creator' : 'Team'}
                    </Badge>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RecipientList;
