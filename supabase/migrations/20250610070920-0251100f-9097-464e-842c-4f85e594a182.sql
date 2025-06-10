
-- Create the social_media_logins table
CREATE TABLE public.social_media_logins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_email TEXT NOT NULL,
  platform TEXT NOT NULL,
  username TEXT,
  password TEXT,
  notes TEXT,
  is_predefined BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one record per creator per platform
  UNIQUE(creator_email, platform)
);

-- Add Row Level Security
ALTER TABLE public.social_media_logins ENABLE ROW LEVEL SECURITY;

-- Create policies for secure access
CREATE POLICY "Allow full access to social media logins" 
  ON public.social_media_logins 
  FOR ALL 
  USING (true);

-- Add updated_at trigger
CREATE TRIGGER handle_updated_at 
  BEFORE UPDATE ON public.social_media_logins 
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Migrate existing data from onboarding_submissions for active creators
INSERT INTO public.social_media_logins (creator_email, platform, username, password, notes, is_predefined)
SELECT 
  os.email,
  'TikTok',
  (os.data->'contentAndService'->'socialMediaHandles'->>'tiktok'),
  (os.data->'contentAndService'->'socialMediaHandles'->'tiktokAccount'->>'password'),
  (os.data->'contentAndService'->'socialMediaHandles'->'tiktokAccount'->>'notes'),
  true
FROM onboarding_submissions os
JOIN creators c ON c.email = os.email
WHERE c.active = true 
  AND os.data->'contentAndService'->'socialMediaHandles'->>'tiktok' IS NOT NULL
  AND os.data->'contentAndService'->'socialMediaHandles'->>'tiktok' != '';

INSERT INTO public.social_media_logins (creator_email, platform, username, password, notes, is_predefined)
SELECT 
  os.email,
  'Twitter',
  (os.data->'contentAndService'->'socialMediaHandles'->>'twitter'),
  (os.data->'contentAndService'->'socialMediaHandles'->'twitterAccount'->>'password'),
  (os.data->'contentAndService'->'socialMediaHandles'->'twitterAccount'->>'notes'),
  true
FROM onboarding_submissions os
JOIN creators c ON c.email = os.email
WHERE c.active = true 
  AND os.data->'contentAndService'->'socialMediaHandles'->>'twitter' IS NOT NULL
  AND os.data->'contentAndService'->'socialMediaHandles'->>'twitter' != '';

INSERT INTO public.social_media_logins (creator_email, platform, username, password, notes, is_predefined)
SELECT 
  os.email,
  'OnlyFans',
  (os.data->'contentAndService'->'socialMediaHandles'->>'onlyfans'),
  (os.data->'contentAndService'->'socialMediaHandles'->'onlyfansAccount'->>'password'),
  (os.data->'contentAndService'->'socialMediaHandles'->'onlyfansAccount'->>'notes'),
  true
FROM onboarding_submissions os
JOIN creators c ON c.email = os.email
WHERE c.active = true 
  AND os.data->'contentAndService'->'socialMediaHandles'->>'onlyfans' IS NOT NULL
  AND os.data->'contentAndService'->'socialMediaHandles'->>'onlyfans' != '';

INSERT INTO public.social_media_logins (creator_email, platform, username, password, notes, is_predefined)
SELECT 
  os.email,
  'Snapchat',
  (os.data->'contentAndService'->'socialMediaHandles'->>'snapchat'),
  (os.data->'contentAndService'->'socialMediaHandles'->'snapchatAccount'->>'password'),
  (os.data->'contentAndService'->'socialMediaHandles'->'snapchatAccount'->>'notes'),
  true
FROM onboarding_submissions os
JOIN creators c ON c.email = os.email
WHERE c.active = true 
  AND os.data->'contentAndService'->'socialMediaHandles'->>'snapchat' IS NOT NULL
  AND os.data->'contentAndService'->'socialMediaHandles'->>'snapchat' != '';

INSERT INTO public.social_media_logins (creator_email, platform, username, password, notes, is_predefined)
SELECT 
  os.email,
  'Instagram',
  (os.data->'contentAndService'->'socialMediaHandles'->>'instagram'),
  (os.data->'contentAndService'->'socialMediaHandles'->'instagramAccount'->>'password'),
  (os.data->'contentAndService'->'socialMediaHandles'->'instagramAccount'->>'notes'),
  true
FROM onboarding_submissions os
JOIN creators c ON c.email = os.email
WHERE c.active = true 
  AND os.data->'contentAndService'->'socialMediaHandles'->>'instagram' IS NOT NULL
  AND os.data->'contentAndService'->'socialMediaHandles'->>'instagram' != '';

-- Migrate "other" platforms from the JSON array
INSERT INTO public.social_media_logins (creator_email, platform, username, password, notes, is_predefined)
SELECT 
  os.email,
  other_platform.value->>'platform',
  other_platform.value->>'username',
  other_platform.value->>'password',
  other_platform.value->>'notes',
  false
FROM onboarding_submissions os
JOIN creators c ON c.email = os.email
CROSS JOIN jsonb_array_elements(os.data->'contentAndService'->'socialMediaHandles'->'other') AS other_platform
WHERE c.active = true 
  AND other_platform.value->>'platform' IS NOT NULL
  AND other_platform.value->>'username' IS NOT NULL;
