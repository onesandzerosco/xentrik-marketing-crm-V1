# Memory: features/gamification/assignment-logic
Updated: 2026-02-05

Quest assignments follow a two-tier architecture:

## Global (Admin) Assignments
- Stored in `gamification_quest_assignments` with `assigned_by = NULL`
- Created by admins via Control Panel
- Visible to all players
- When an admin assigns a quest, it populates personal slots for every player who loads the Quests page

## Personal Slots
- Stored in `gamification_daily_quest_slots`
- Each player has their own slots: 1-4 for Daily, 100 for Weekly, 200 for Monthly
- When a player loads the Quests page, their slots are populated from admin assignments
- Players can re-roll slots to get different quests without affecting others

## Personal Assignments (for Re-rolled Quests)
- When a player re-rolls and then clicks "Log Activity", a personal assignment is created
- These have `assigned_by = user.id` (not NULL)
- They are ONLY used for tracking that specific user's progress/completion
- Other players do NOT see these assignments when loading quests (filtered by `assigned_by IS NULL`)

## Critical Implementation Details
- Slot population queries MUST filter: `.is('assigned_by', null)` to only get admin assignments
- Completion status queries should check admin assignments first, then fall back to personal assignments
- This ensures re-rolls are isolated per-player while still allowing progress tracking
