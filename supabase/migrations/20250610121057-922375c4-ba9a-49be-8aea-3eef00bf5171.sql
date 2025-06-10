
-- First, let's see what duplicates we have
SELECT 
  creator_email, 
  platform, 
  username, 
  is_predefined, 
  created_at,
  COUNT(*) as duplicate_count
FROM social_media_logins 
WHERE creator_email = (
  SELECT email FROM onboarding_submissions 
  WHERE id = 'ed7c3971-23a3-441a-9760-ece9e5584a0b'
)
GROUP BY creator_email, platform, username, is_predefined, created_at
HAVING COUNT(*) > 1
ORDER BY platform, created_at;

-- Clean up duplicates by keeping only the most recent entry with actual data for each platform
WITH ranked_entries AS (
  SELECT 
    id,
    creator_email,
    platform,
    username,
    password,
    notes,
    is_predefined,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY creator_email, platform 
      ORDER BY 
        CASE WHEN username IS NOT NULL AND username != '' THEN 0 ELSE 1 END,
        created_at DESC
    ) as rn
  FROM social_media_logins 
  WHERE creator_email = (
    SELECT email FROM onboarding_submissions 
    WHERE id = 'ed7c3971-23a3-441a-9760-ece9e5584a0b'
  )
)
DELETE FROM social_media_logins 
WHERE id IN (
  SELECT id FROM ranked_entries WHERE rn > 1
);

-- Verify the cleanup worked
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
