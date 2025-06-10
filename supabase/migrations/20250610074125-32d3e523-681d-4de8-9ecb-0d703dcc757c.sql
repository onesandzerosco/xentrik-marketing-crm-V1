
-- Search for any creator with "faye" in the name (case insensitive)
SELECT 
    id, 
    name, 
    email, 
    active, 
    needs_review,
    created_at
FROM creators 
WHERE LOWER(name) LIKE '%faye%';

-- Search for any creator with "smith" in the name
SELECT 
    id, 
    name, 
    email, 
    active, 
    needs_review,
    created_at
FROM creators 
WHERE LOWER(name) LIKE '%smith%';

-- Check all onboarding submissions with "faye" in name
SELECT 
    id,
    name,
    email,
    status,
    submitted_at
FROM onboarding_submissions 
WHERE LOWER(name) LIKE '%faye%';

-- Check all social media logins with "faye" in email
SELECT * FROM social_media_logins 
WHERE LOWER(creator_email) LIKE '%faye%';

-- Get all creators to see what's in the system
SELECT 
    id, 
    name, 
    email, 
    active
FROM creators 
ORDER BY name;
