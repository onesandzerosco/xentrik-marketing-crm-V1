import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Plus, Check, X, Clock, Calendar, Star, Medal, Crown, Eye, Pencil, XCircle } from 'lucide-react';
import { useGamification, Quest, QuestAssignment } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import QuestCompletionModal from './QuestCompletionModal';
import QuestReviewModal from './QuestReviewModal';
import DailyQuestSlots from './DailyQuestSlots';
import WeeklyQuestSlots from './WeeklyQuestSlots';
import MonthlyQuestSlots from './MonthlyQuestSlots';

interface QuestsPanelProps {
  isAdmin: boolean;
}

const QuestsPanel: React.FC<QuestsPanelProps> = ({ isAdmin }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const {
    quests,
    activeAssignments,
    myCompletions,
    isLoading,
    submitQuestCompletion,
    verifyQuestCompletion,
    refetch
  } = useGamification();

  const [isCreating, setIsCreating] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedQuestType, setSelectedQuestType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [newQuest, setNewQuest] = useState({
    title: '',
    description: '',
    quest_type: 'daily' as 'daily' | 'weekly' | 'monthly',
    xp_reward: 10,
    banana_reward: 5
  });
  const [selectedQuestForAssign, setSelectedQuestForAssign] = useState<string>('');
  const [pendingCompletions, setPendingCompletions] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<QuestAssignment | null>(null);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [selectedCompletionForReview, setSelectedCompletionForReview] = useState<any>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editGameName, setEditGameName] = useState('');
  const [editXpReward, setEditXpReward] = useState(0);
  const [editBananaReward, setEditBananaReward] = useState(0);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Fetch pending completions for admin
  React.useEffect(() => {
    if (isAdmin) {
      fetchPendingCompletions();
    }
  }, [isAdmin]);

  const fetchPendingCompletions = async () => {
    const { data, error } = await supabase
      .from('gamification_quest_completions')
      .select(`
        *,
        profile:profiles!gamification_quest_completions_chatter_id_fkey (name),
        quest_assignment:gamification_quest_assignments (
          quest:gamification_quests (title, description, xp_reward, banana_reward)
        )
      `)
      .eq('status', 'pending')
      .order('completed_at', { ascending: false });

    if (!error) {
      setPendingCompletions((data as any) || []);
    }
  };

  const handleOpenQuestModal = (assignment: QuestAssignment) => {
    setSelectedAssignment(assignment);
    setIsCompletionModalOpen(true);
  };

  const handleQuestSubmitComplete = () => {
    refetch.myCompletions();
    if (isAdmin) {
      fetchPendingCompletions();
    }
  };

  const handleOpenReviewModal = (completion: any) => {
    setSelectedCompletionForReview(completion);
    setIsReviewModalOpen(true);
  };

  const handleCreateQuest = async () => {
    if (!newQuest.title.trim()) {
      toast({ title: "Error", description: "Quest title is required", variant: "destructive" });
      return;
    }

    try {
      setIsCreating(true);
      const { error } = await supabase
        .from('gamification_quests')
        .insert({
          ...newQuest,
          created_by: user?.id
        });

      if (error) throw error;

      toast({ title: "Success", description: "Quest created successfully!" });
      setNewQuest({ title: '', description: '', quest_type: 'daily', xp_reward: 10, banana_reward: 5 });
      refetch.quests();
    } catch (error) {
      console.error('Error creating quest:', error);
      toast({ title: "Error", description: "Failed to create quest", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleAssignQuest = async () => {
    if (!selectedQuestForAssign) {
      toast({ title: "Error", description: "Please select a quest", variant: "destructive" });
      return;
    }

    const quest = quests.find(q => q.id === selectedQuestForAssign);
    if (!quest) return;

    let startDate: Date;
    let endDate: Date;
    const today = new Date();

    switch (quest.quest_type) {
      case 'daily':
        startDate = today;
        endDate = today;
        break;
      case 'weekly':
        startDate = startOfWeek(today, { weekStartsOn: 1 });
        endDate = endOfWeek(today, { weekStartsOn: 1 });
        break;
      case 'monthly':
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
        break;
    }

    try {
      setIsAssigning(true);
      const { error } = await supabase
        .from('gamification_quest_assignments')
        .insert({
          quest_id: selectedQuestForAssign,
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: format(endDate, 'yyyy-MM-dd'),
          assigned_by: user?.id
        });

      if (error) throw error;

      toast({ title: "Success", description: "Quest assigned successfully!" });
      setSelectedQuestForAssign('');
      refetch.activeAssignments();
    } catch (error) {
      console.error('Error assigning quest:', error);
      toast({ title: "Error", description: "Failed to assign quest", variant: "destructive" });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleVerify = async (completionId: string, approve: boolean) => {
    const success = await verifyQuestCompletion(completionId, approve);
    if (success) {
      fetchPendingCompletions();
      refetch.leaderboard();
    }
  };

  const handleOpenEditDialog = (quest: Quest) => {
    setEditingQuest(quest);
    setEditDescription(quest.description || '');
    setEditGameName(quest.game_name || '');
    setEditXpReward(quest.xp_reward || 0);
    setEditBananaReward(quest.banana_reward || 0);
  };

  const handleSaveQuest = async () => {
    if (!editingQuest) return;

    try {
      setIsSavingEdit(true);
      const { error } = await supabase
        .from('gamification_quests')
        .update({ 
          description: editDescription,
          game_name: editGameName || null,
          xp_reward: editXpReward,
          banana_reward: editBananaReward
        })
        .eq('id', editingQuest.id);

      if (error) throw error;

      toast({ title: "Success", description: "Quest updated!" });
      setEditingQuest(null);
      refetch.quests();
    } catch (error) {
      console.error('Error updating quest:', error);
      toast({ title: "Error", description: "Failed to update quest", variant: "destructive" });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleCloseAssignment = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('gamification_quest_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      toast({ title: "Success", description: "Quest assignment closed" });
      refetch.activeAssignments();
    } catch (error) {
      console.error('Error closing assignment:', error);
      toast({ title: "Error", description: "Failed to close assignment", variant: "destructive" });
    }
  };

  const getCompletionStatus = (assignmentId: string) => {
    return myCompletions.find(c => c.quest_assignment_id === assignmentId);
  };

  const filterQuestsByType = (type: 'daily' | 'weekly' | 'monthly') => {
    return activeAssignments.filter(a => a.quest?.quest_type === type);
  };

  const getQuestIcon = (type: string) => {
    switch (type) {
      case 'daily': return <Star className="h-4 w-4 text-yellow-500" />;
      case 'weekly': return <Medal className="h-4 w-4 text-blue-500" />;
      case 'monthly': return <Crown className="h-4 w-4 text-purple-500" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4" style={{ fontFamily: "'Pixellari', sans-serif" }}>
      {/* Admin Controls */}
      {isAdmin && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-xl" style={{ fontFamily: "'Macs Minecraft', sans-serif" }}>Admin Controls</CardTitle>
            <CardDescription className="text-base">Create and manage quests for chatters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              {/* Create Quest Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Quest
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Quest</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input 
                        value={newQuest.title}
                        onChange={e => setNewQuest({ ...newQuest, title: e.target.value })}
                        placeholder="e.g., Sell 5 customs today"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea 
                        value={newQuest.description}
                        onChange={e => setNewQuest({ ...newQuest, description: e.target.value })}
                        placeholder="Describe what needs to be done..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Quest Type</Label>
                      <Select 
                        value={newQuest.quest_type}
                        onValueChange={(v: 'daily' | 'weekly' | 'monthly') => setNewQuest({ ...newQuest, quest_type: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>XP Reward</Label>
                        <Input 
                          type="number"
                          value={newQuest.xp_reward}
                          onChange={e => setNewQuest({ ...newQuest, xp_reward: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Banana Reward 🍌</Label>
                        <Input 
                          type="number"
                          value={newQuest.banana_reward}
                          onChange={e => setNewQuest({ ...newQuest, banana_reward: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreateQuest} disabled={isCreating}>
                      {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Create Quest
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Assign Quest Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Assign Quest
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Assign Quest for Current Period</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Select Quest</Label>
                      <Select 
                        value={selectedQuestForAssign}
                        onValueChange={setSelectedQuestForAssign}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a quest..." />
                        </SelectTrigger>
                        <SelectContent>
                          {quests.filter(q => q.is_active).map(quest => (
                            <SelectItem key={quest.id} value={quest.id}>
                              <div className="flex items-center gap-2">
                                {getQuestIcon(quest.quest_type)}
                                <span>{quest.title}</span>
                                <Badge variant="outline" className="ml-2">
                                  {quest.quest_type}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {selectedQuestForAssign && (
                      <div className="text-sm text-muted-foreground">
                        The quest will be assigned based on its type:
                        <ul className="list-disc list-inside mt-1">
                          <li>Daily: Today only</li>
                          <li>Weekly: Current week (Mon-Sun)</li>
                          <li>Monthly: Current month</li>
                        </ul>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAssignQuest} disabled={isAssigning || !selectedQuestForAssign}>
                      {isAssigning && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Assign Quest
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Pending Verifications */}
            {pendingCompletions.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold mb-3">Pending Verifications ({pendingCompletions.length})</h3>
                <div className="space-y-2">
                  {pendingCompletions.map(completion => (
                    <div key={completion.id} className="flex items-center justify-between p-3 rounded-lg bg-background border">
                      <div>
                        <p className="font-medium">{completion.profile?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {completion.quest_assignment?.quest?.title}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">+{completion.xp_earned} XP</Badge>
                          <Badge variant="outline" className="text-yellow-600">+{completion.bananas_earned} 🍌</Badge>
                          {completion.attachments?.length > 0 && (
                            <Badge variant="outline" className="text-blue-600">
                              {completion.attachments.length} screenshot{completion.attachments.length > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleOpenReviewModal(completion)}
                        >
                          <Eye className="h-4 w-4 mr-1" /> Review
                        </Button>
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => handleVerify(completion.id, true)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleVerify(completion.id, false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Chatter View: Sub-tabs for quest categories */}
      {!isAdmin && (
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-3 h-auto p-1">
            <TabsTrigger 
              value="daily" 
              className="flex items-center gap-2 py-2"
              style={{ fontFamily: "'Macs Minecraft', sans-serif" }}
            >
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-xs">Daily</span>
            </TabsTrigger>
            <TabsTrigger 
              value="weekly" 
              className="flex items-center gap-2 py-2"
              style={{ fontFamily: "'Macs Minecraft', sans-serif" }}
            >
              <Medal className="h-4 w-4 text-blue-500" />
              <span className="text-xs">Weekly</span>
            </TabsTrigger>
            <TabsTrigger 
              value="special-ops" 
              className="flex items-center gap-2 py-2"
              style={{ fontFamily: "'Macs Minecraft', sans-serif" }}
            >
              <Crown className="h-4 w-4 text-purple-500" />
              <span className="text-xs">Special Ops</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily">
            <DailyQuestSlots 
              onQuestComplete={() => {
                refetch.myCompletions();
                refetch.leaderboard();
              }} 
            />
          </TabsContent>

          <TabsContent value="weekly">
            <WeeklyQuestSlots 
              onQuestComplete={() => {
                refetch.myCompletions();
                refetch.leaderboard();
              }} 
            />
          </TabsContent>

          <TabsContent value="special-ops">
            <MonthlyQuestSlots 
              onQuestComplete={() => {
                refetch.myCompletions();
                refetch.leaderboard();
              }} 
            />
          </TabsContent>
        </Tabs>
      )}

      {/* Admin View: Tabs for quest assignments */}
      {isAdmin && (
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Daily ({filterQuestsByType('daily').length})
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex items-center gap-2">
              <Medal className="h-4 w-4" />
              Weekly ({filterQuestsByType('weekly').length})
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Monthly ({filterQuestsByType('monthly').length})
            </TabsTrigger>
          </TabsList>

          {['daily', 'weekly', 'monthly'].map(type => (
            <TabsContent key={type} value={type} className="mt-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filterQuestsByType(type as 'daily' | 'weekly' | 'monthly').map(assignment => {
                  const completion = getCompletionStatus(assignment.id);
                  const quest = assignment.quest;
                  if (!quest) return null;

                  return (
                    <Card key={assignment.id} className="relative overflow-hidden">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive z-10"
                        onClick={() => handleCloseAssignment(assignment.id)}
                        title="Close this quest assignment"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                      {completion?.status === 'verified' && (
                        <div className="absolute top-0 left-0 bg-green-500 text-white px-2 py-1 text-xs font-medium rounded-br">
                          ✓ Completed
                        </div>
                      )}
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{quest.title}</CardTitle>
                            {quest.description && (
                              <CardDescription className="mt-1">{quest.description}</CardDescription>
                            )}
                          </div>
                          {getQuestIcon(quest.quest_type)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">+{quest.xp_reward}</span>
                            <span className="text-xs text-muted-foreground">XP</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-lg">🍌</span>
                            <span className="text-sm font-medium">+{quest.banana_reward}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <span>Valid: {format(new Date(assignment.start_date), 'MMM d')} - {format(new Date(assignment.end_date), 'MMM d')}</span>
                        </div>

                        {completion ? (
                          <Badge 
                            variant={
                              completion.status === 'verified' ? 'default' : 
                              completion.status === 'pending' ? 'secondary' : 
                              'destructive'
                            }
                            className="w-full justify-center py-2"
                          >
                            {completion.status === 'verified' && <Check className="h-4 w-4 mr-1" />}
                            {completion.status === 'pending' && <Clock className="h-4 w-4 mr-1" />}
                            {completion.status === 'rejected' && <X className="h-4 w-4 mr-1" />}
                            {completion.status === 'verified' ? 'Completed!' : 
                             completion.status === 'pending' ? 'Pending Verification' : 
                             'Rejected'}
                          </Badge>
                        ) : (
                          <Button 
                            className="w-full" 
                            onClick={() => handleOpenQuestModal(assignment)}
                          >
                            View Quest
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}

                {filterQuestsByType(type as 'daily' | 'weekly' | 'monthly').length === 0 && (
                  <Card className="col-span-full">
                    <CardContent className="py-12 text-center text-muted-foreground">
                      No {type} quests assigned for the current period.
                      Create and assign quests using the admin controls above.
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* All Quests Table (Admin) */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl" style={{ fontFamily: "'Macs Minecraft', sans-serif" }}>All Quests</CardTitle>
            <CardDescription className="text-base">Manage all quest definitions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                    <TableHead className="text-left text-base">Title</TableHead>
                    <TableHead className="text-left text-base">Game Name</TableHead>
                    <TableHead className="text-base">Type</TableHead>
                    <TableHead className="text-base">XP</TableHead>
                    <TableHead className="text-base">Bananas</TableHead>
                    <TableHead className="text-base">Status</TableHead>
                    <TableHead className="text-base">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quests.map(quest => (
                    <TableRow key={quest.id}>
                      <TableCell className="font-medium text-left text-base">{quest.title}</TableCell>
                      <TableCell className="text-left text-base text-muted-foreground">{quest.game_name || '—'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-sm">{quest.quest_type}</Badge>
                      </TableCell>
                      <TableCell className="text-base">{quest.xp_reward}</TableCell>
                      <TableCell className="text-base">{quest.banana_reward} 🍌</TableCell>
                      <TableCell>
                        <Badge variant={quest.is_active ? 'default' : 'secondary'}>
                          {quest.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleOpenEditDialog(quest)}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={async () => {
                              await supabase
                                .from('gamification_quests')
                                .update({ is_active: !quest.is_active })
                                .eq('id', quest.id);
                              refetch.quests();
                            }}
                          >
                            {quest.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          </CardContent>
        </Card>
      )}

      {/* Quest Completion Modal */}
      {selectedAssignment && (
        <QuestCompletionModal
          open={isCompletionModalOpen}
          onOpenChange={setIsCompletionModalOpen}
          assignment={selectedAssignment}
          onSubmitComplete={handleQuestSubmitComplete}
        />
      )}

      {/* Quest Review Modal (Admin) */}
      <QuestReviewModal
        open={isReviewModalOpen}
        onOpenChange={setIsReviewModalOpen}
        completion={selectedCompletionForReview}
        onApprove={(id) => handleVerify(id, true)}
        onReject={(id) => handleVerify(id, false)}
      />

      {/* Edit Quest Dialog (Admin) */}
      <Dialog open={!!editingQuest} onOpenChange={(open) => !open && setEditingQuest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Quest</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="text-base font-medium mb-2">Quest: {editingQuest?.title}</p>
              <Badge variant="outline" className="mb-4 text-sm">{editingQuest?.quest_type}</Badge>
            </div>

            <div className="space-y-2">
              <Label className="text-base">Game Name</Label>
              <Input 
                value={editGameName}
                onChange={e => setEditGameName(e.target.value)}
                placeholder="Enter game-themed name (e.g., 'Shadow Strike')"
                className="text-base"
              />
              <p className="text-sm text-muted-foreground">
                An optional game-themed alias displayed alongside the quest title.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-base">XP Reward</Label>
                <Input 
                  type="number"
                  value={editXpReward}
                  onChange={e => setEditXpReward(parseInt(e.target.value) || 0)}
                  min={0}
                  className="text-base"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-base">Banana Reward 🍌</Label>
                <Input 
                  type="number"
                  value={editBananaReward}
                  onChange={e => setEditBananaReward(parseInt(e.target.value) || 0)}
                  min={0}
                  className="text-base"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base">Instructions / Description</Label>
              <Textarea 
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                placeholder="Enter detailed instructions for this quest..."
                rows={6}
                className="text-base"
              />
              <p className="text-sm text-muted-foreground">
                This will be shown to chatters when they view the quest details.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingQuest(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveQuest} disabled={isSavingEdit}>
              {isSavingEdit && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Quest
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuestsPanel;
