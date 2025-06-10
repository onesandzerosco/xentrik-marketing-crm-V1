
-- First, let's see what data structure we're working with
SELECT 
  id,
  email,
  data->'contentAndService'->'socialMediaHandles' as social_handles_path1,
  data->'socialMediaHandles' as social_handles_path2,
  data->'contentAndService' as content_service_data,
  data as full_data
FROM onboarding_submissions 
WHERE id = 'ed7c3971-23a3-441a-9760-ece9e5584a0b';

-- Now insert/update with multiple path checks for TikTok specifically
WITH submission_data AS (
  SELECT 
    email,
    COALESCE(
      data->'contentAndService'->'socialMediaHandles'->>'tiktok',
      data->'socialMediaHandles'->>'tiktok',
      data->>'tiktok'
    ) as tiktok_handle
  FROM onboarding_submissions 
  WHERE id = 'ed7c3971-23a3-441a-9760-ece9e5584a0b'
)
INSERT INTO social_media_logins (creator_email, platform, username, password, notes, is_predefined)
SELECT 
  email,
  'Tiktok' as platform,
  COALESCE(tiktok_handle, '') as username,
  '' as password,
  'Updated from specific TikTok extraction' as notes,
  true as is_predefined
FROM submission_data
WHERE email IS NOT NULL

ON CONFLICT (creator_email, platform) 
DO UPDATE SET 
  username = EXCLUDED.username,
  notes = EXCLUDED.notes,
  updated_at = now();
