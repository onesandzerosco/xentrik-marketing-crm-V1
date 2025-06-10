
-- First, let's see exactly what's in the database for this specific creator
SELECT 
  id,
  creator_email, 
  platform, 
  username, 
  password,
  notes,
  is_predefined, 
  created_at
FROM social_media_logins 
WHERE creator_email = (
  SELECT email FROM onboarding_submissions 
  WHERE id = 'ed7c3971-23a3-441a-9760-ece9e5584a0b'
)
ORDER BY platform, created_at;

-- Delete ALL social media logins for this specific creator
DELETE FROM social_media_logins 
WHERE creator_email = (
  SELECT email FROM onboarding_submissions 
  WHERE id = 'ed7c3971-23a3-441a-9760-ece9e5584a0b'
);

-- Now re-insert ONLY the platforms that have actual data from the onboarding submission
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
  platform,
  COALESCE(handle, '') as username,
  '' as password,
  '' as notes,
  true as is_predefined
FROM submission_data,
LATERAL (
  VALUES 
    ('Instagram', social_handles->>'instagram'),
    ('TikTok', social_handles->>'tiktok'),
    ('Twitter', social_handles->>'twitter'),
    ('OnlyFans', social_handles->>'onlyfans'),
    ('Snapchat', social_handles->>'snapchat')
) AS platforms(platform, handle)
WHERE social_handles IS NOT NULL 
  AND handle IS NOT NULL 
  AND handle != '';

-- Verify the final result
SELECT 
  creator_email, 
  platform, 
  username, 
  is_predefined,
  created_at
FROM social_media_logins 
WHERE creator_email = (
  SELECT email FROM onboarding_submissions 
  WHERE id = 'ed7c3971-23a3-441a-9760-ece9e5584a0b'
)
ORDER BY platform;
