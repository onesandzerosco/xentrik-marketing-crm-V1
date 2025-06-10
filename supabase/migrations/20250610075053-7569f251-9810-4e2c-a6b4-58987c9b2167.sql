
-- Check for the other UUID you mentioned
SELECT 
    id, 
    name, 
    email, 
    active, 
    needs_review,
    created_at
FROM creators 
WHERE id = '6cf28f03-b383-4aa1-ab21-e4c45fefe186';

-- Check social links for the other UUID
SELECT * FROM creator_social_links 
WHERE creator_id = '6cf28f03-b383-4aa1-ab21-e4c45fefe186';

-- Check social media logins for the other UUID
SELECT sml.* 
FROM social_media_logins sml
JOIN creators c ON c.email = sml.creator_email
WHERE c.id = '6cf28f03-b383-4aa1-ab21-e4c45fefe186';

-- Check if there are any records in any table with either UUID
SELECT 'creators' as table_name, id, name FROM creators WHERE id IN ('ca08d8e9-ce1f-4674-bfa0-e168f3e0f5af', '6cf28f03-b383-4aa1-ab21-e4c45fefe186')
UNION ALL
SELECT 'creator_social_links' as table_name, creator_id, '' FROM creator_social_links WHERE creator_id IN ('ca08d8e9-ce1f-4674-bfa0-e168f3e0f5af', '6cf28f03-b383-4aa1-ab21-e4c45fefe186')
UNION ALL
SELECT 'creator_tags' as table_name, creator_id, '' FROM creator_tags WHERE creator_id IN ('ca08d8e9-ce1f-4674-bfa0-e168f3e0f5af', '6cf28f03-b383-4aa1-ab21-e4c45fefe186');
