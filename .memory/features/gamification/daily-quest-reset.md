# Memory: features/gamification/daily-quest-reset
Updated: 2026-02-21

## 10pm Daily Quest Reset

Daily quests reset at **10pm (22:00)**, not midnight.

### How It Works
- The utility `getDailyQuestDate()` in `src/utils/dailyQuestDate.ts` shifts the effective date forward when the current time is 10pm or later
- At 10pm Monday, the effective quest date becomes Tuesday → new daily quests appear
- Tuesday's quests remain active until 10pm Tuesday

### Files Using This Utility
- `src/hooks/useDailyQuestSlots.ts` - personal slot population and fetching
- `src/components/gamification/AdminDailyQuestSlots.tsx` - admin view of assigned daily quests
- `src/components/gamification/DailyQuestSlots.tsx` - player daily quest display
- `src/components/gamification/GameBoard.tsx` - game board progress tracking
- `src/components/gamification/ChatterQuestsPage.tsx` - chatter quests page with assignment lookup

### Important
- Weekly and monthly quests are NOT affected by this cutoff - they use standard calendar dates
- Admin should assign new daily quests at 10pm each day to align with the reset
