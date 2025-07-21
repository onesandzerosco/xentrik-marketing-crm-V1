-- Create default marketing categories and folders for all existing creators except Zoey
-- This will set up the 7 required categories with their specific folders

DO $$
DECLARE
    creator_record RECORD;
    category_id_personality UUID := gen_random_uuid();
    category_id_ai_generated UUID := gen_random_uuid();
    category_id_nsfw UUID := gen_random_uuid();
    category_id_sfw UUID := gen_random_uuid();
    category_id_reddit_verification UUID := gen_random_uuid();
    category_id_reels UUID := gen_random_uuid();
    category_id_scripts UUID := gen_random_uuid();
BEGIN
    -- Loop through all creators except Zoey
    FOR creator_record IN 
        SELECT id, name 
        FROM creators 
        WHERE id != '54506821-d962-425f-89d9-db061ed8fa78'  -- Exclude Zoey
        AND NOT EXISTS (
            SELECT 1 FROM file_categories WHERE creator = creators.id
        )  -- Only creators who don't already have categories
    LOOP
        RAISE NOTICE 'Creating marketing structure for creator: % (ID: %)', creator_record.name, creator_record.id;
        
        -- Generate new UUIDs for this creator's categories
        category_id_personality := gen_random_uuid();
        category_id_ai_generated := gen_random_uuid();
        category_id_nsfw := gen_random_uuid();
        category_id_sfw := gen_random_uuid();
        category_id_reddit_verification := gen_random_uuid();
        category_id_reels := gen_random_uuid();
        category_id_scripts := gen_random_uuid();
        
        -- Insert the 7 categories for this creator
        INSERT INTO file_categories (category_id, category_name, creator, created_at) VALUES
        (category_id_personality, 'Personality', creator_record.id, now()),
        (category_id_ai_generated, 'AI Generated', creator_record.id, now()),
        (category_id_nsfw, 'NSFW', creator_record.id, now()),
        (category_id_sfw, 'SFW', creator_record.id, now()),
        (category_id_reddit_verification, 'Reddit Verification', creator_record.id, now()),
        (category_id_reels, 'Reels', creator_record.id, now()),
        (category_id_scripts, 'Scripts', creator_record.id, now());
        
        -- Insert folders for Personality category
        INSERT INTO file_folders (folder_id, folder_name, category_id, creator_id, created_at) VALUES
        (gen_random_uuid(), 'Food', category_id_personality, creator_record.id, now()),
        (gen_random_uuid(), 'Hobby', category_id_personality, creator_record.id, now()),
        (gen_random_uuid(), 'Pet', category_id_personality, creator_record.id, now()),
        (gen_random_uuid(), 'Niche', category_id_personality, creator_record.id, now());
        
        -- Insert folders for AI Generated category
        INSERT INTO file_folders (folder_id, folder_name, category_id, creator_id, created_at) VALUES
        (gen_random_uuid(), 'Photos', category_id_ai_generated, creator_record.id, now()),
        (gen_random_uuid(), 'Videos', category_id_ai_generated, creator_record.id, now());
        
        -- Insert folders for NSFW category
        INSERT INTO file_folders (folder_id, folder_name, category_id, creator_id, created_at) VALUES
        (gen_random_uuid(), 'Photos', category_id_nsfw, creator_record.id, now()),
        (gen_random_uuid(), 'Videos', category_id_nsfw, creator_record.id, now());
        
        -- Insert folders for SFW category
        INSERT INTO file_folders (folder_id, folder_name, category_id, creator_id, created_at) VALUES
        (gen_random_uuid(), 'Photos', category_id_sfw, creator_record.id, now()),
        (gen_random_uuid(), 'Videos', category_id_sfw, creator_record.id, now());
        
        -- Insert folders for Reddit Verification category
        INSERT INTO file_folders (folder_id, folder_name, category_id, creator_id, created_at) VALUES
        (gen_random_uuid(), 'Current Month', category_id_reddit_verification, creator_record.id, now()),
        (gen_random_uuid(), 'Previous Months', category_id_reddit_verification, creator_record.id, now());
        
        -- Insert folders for Reels category
        INSERT INTO file_folders (folder_id, folder_name, category_id, creator_id, created_at) VALUES
        (gen_random_uuid(), 'Uploaded', category_id_reels, creator_record.id, now()),
        (gen_random_uuid(), 'Scheduled', category_id_reels, creator_record.id, now()),
        (gen_random_uuid(), 'To Schedule', category_id_reels, creator_record.id, now());
        
        -- Scripts category has no folders as requested
        
        RAISE NOTICE 'Completed marketing structure for creator: %', creator_record.name;
        
    END LOOP;
    
    RAISE NOTICE 'Marketing structure creation completed for all eligible creators';
END $$;