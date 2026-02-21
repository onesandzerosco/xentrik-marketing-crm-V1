-- Add custom word fields to quest assignments
-- Admins can set a custom word + description when assigning Ability Rotation / Empowered Ability quests
ALTER TABLE public.gamification_quest_assignments
  ADD COLUMN custom_word text DEFAULT NULL,
  ADD COLUMN custom_word_description text DEFAULT NULL;