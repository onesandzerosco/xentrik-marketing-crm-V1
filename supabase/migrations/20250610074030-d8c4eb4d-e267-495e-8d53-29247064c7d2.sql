
-- Check if Faye Smith exists in creators table with the provided UUID
SELECT 
    id, 
    name, 
    email, 
    active, 
    needs_review,
    created_at
FROM creators 
WHERE id = 'ca08d8e9-ce1f-4674-bfa0-e168f3e0f5af';

-- Check if there are multiple records for Faye Smith
SELECT 
    id, 
    name, 
    email, 
    active, 
    needs_review,
    created_at
FROM creators 
WHERE LOWER(name) LIKE '%faye%smith%' OR LOWER(name) LIKE '%faye smith%';

-- Check social links for Faye's UUID
SELECT * FROM creator_social_links 
WHERE creator_id = 'ca08d8e9-ce1f-4674-bfa0-e168f3e0f5af';

-- Check social media logins for Faye (using email from creators table)
SELECT sml.* 
FROM social_media_logins sml
JOIN creators c ON c.email = sml.creator_email
WHERE c.id = 'ca08d8e9-ce1f-4674-bfa0-e168f3e0f5af';

-- Check if there are any orphaned social_media_logins records for Faye
SELECT * FROM social_media_logins 
WHERE creator_email LIKE '%faye%' OR creator_email LIKE '%smith%';

-- Check onboarding submissions for Faye
SELECT 
    id,
    name,
    email,
    status,
    submitted_at
FROM onboarding_submissions 
WHERE LOWER(name) LIKE '%faye%smith%' OR LOWER(name) LIKE '%faye smith%';
