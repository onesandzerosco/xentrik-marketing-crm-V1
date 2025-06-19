
-- Update existing onboarding_submissions to add the new fields to contentAndService
UPDATE onboarding_submissions 
SET data = jsonb_set(
  jsonb_set(
    data,
    '{contentAndService,customVideoNotes}',
    '""'::jsonb,
    true
  ),
  '{contentAndService,videoCallNotes}',
  '""'::jsonb,
  true
)
WHERE data ? 'contentAndService' 
AND NOT (data->'contentAndService' ? 'customVideoNotes');

-- Update existing creators to add the new fields to model_profile contentAndService
UPDATE creators 
SET model_profile = jsonb_set(
  jsonb_set(
    model_profile,
    '{contentAndService,customVideoNotes}',
    '""'::jsonb,
    true
  ),
  '{contentAndService,videoCallNotes}',
  '""'::jsonb,
  true
)
WHERE model_profile ? 'contentAndService' 
AND NOT (model_profile->'contentAndService' ? 'customVideoNotes');
