import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, Sparkles } from 'lucide-react';
import { useWordOfTheDay } from '@/hooks/useWordOfTheDay';

const WordOfTheDayWidget: React.FC = () => {
  const { dailyWord, isLoading, error } = useWordOfTheDay();

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border-purple-500/20">
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
        </CardContent>
      </Card>
    );
  }

  if (error || !dailyWord) {
    return null; // Silently fail - widget is optional
  }

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border-purple-500/20 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Word of the Day
          <Sparkles className="h-3 w-3 text-yellow-500" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-purple-400">{dailyWord.word}</h3>
            {dailyWord.part_of_speech && (
              <Badge variant="outline" className="text-xs text-purple-300 border-purple-300/50">
                {dailyWord.part_of_speech}
              </Badge>
            )}
          </div>
          {dailyWord.definition && (
            <p className="text-sm text-muted-foreground italic">
              "{dailyWord.definition}"
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            Use this word in your conversations today! 🎯
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WordOfTheDayWidget;
