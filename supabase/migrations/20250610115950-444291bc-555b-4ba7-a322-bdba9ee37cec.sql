
-- Insert or update social media handles from onboarding submission
-- Extract from onboarding_submissions where id = 'ed7c3971-23a3-441a-9760-ece9e5584a0b'
-- Use ON CONFLICT to handle existing records

WITH submission_data AS (
  SELECT 
    email,
    data->'contentAndService'->'socialMediaHandles' as social_handles
  FROM onboarding_submissions 
  WHERE id = 'ed7c3971-23a3-441a-9760-ece9e5584a0b'
)
INSERT INTO social_media_logins (creator_email, platform, username, password, notes, is_predefined)
SELECT 
  email,
  'Instagram' as platform,
  COALESCE(social_handles->>'instagram', '') as username,
  '' as password,
  '' as notes,
  true as is_predefined
FROM submission_data
WHERE social_handles IS NOT NULL

UNION ALL

SELECT 
  email,
  'Tiktok' as platform,
  COALESCE(social_handles->>'tiktok', '') as username,
  '' as password,
  '' as notes,
  true as is_predefined
FROM submission_data
WHERE social_handles IS NOT NULL

UNION ALL

SELECT 
  email,
  'Twitter' as platform,
  COALESCE(social_handles->>'twitter', '') as username,
  '' as password,
  '' as notes,
  true as is_predefined
FROM submission_data
WHERE social_handles IS NOT NULL

UNION ALL

SELECT 
  email,
  'Onlyfans' as platform,
  COALESCE(social_handles->>'onlyfans', '') as username,
  '' as password,
  '' as notes,
  true as is_predefined
FROM submission_data
WHERE social_handles IS NOT NULL

UNION ALL

SELECT 
  email,
  'Snapchat' as platform,
  COALESCE(social_handles->>'snapchat', '') as username,
  '' as password,
  '' as notes,
  true as is_predefined
FROM submission_data
WHERE social_handles IS NOT NULL

ON CONFLICT (creator_email, platform) 
DO UPDATE SET 
  username = EXCLUDED.username,
  updated_at = now();
