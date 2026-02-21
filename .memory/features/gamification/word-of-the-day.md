# Memory: features/gamification/word-of-the-day
Updated: 2026-02-21

## Custom Word Assignment

Admins can set a **custom word and description** when assigning Ability Rotation or Empowered Ability quests (any quest with game_name containing "Ability Rotation" / "Empowered Ability" or title containing "Word of the Day").

### Flow
1. Admin clicks "Assign Quest" in Control Panel
2. Selects an Ability Rotation / Empowered Ability quest
3. Word and Word Description fields appear in the dialog
4. Admin enters custom word + description and confirms
5. Stored in `gamification_quest_assignments.custom_word` and `custom_word_description`
6. Chatters see the admin's custom word instead of auto-generated words

### Database
- `gamification_quest_assignments.custom_word` (text, nullable)
- `gamification_quest_assignments.custom_word_description` (text, nullable)

### Hook: useWordOfTheDay
- Accepts optional `assignmentId` parameter
- Priority: custom word from assignment → fallback to gamification_daily_words table → edge function generation
- Used by: QuestDetailsModal, QuestEvidenceUpload, QuestCompletionModal, DailyQuestCompletionModal

### Detection Logic
A quest is considered a "word quest" if:
- `game_name` contains "ability rotation" or "empowered ability" (case-insensitive)
- OR `title` contains "word of the day" (case-insensitive)
