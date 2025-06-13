
-- Update onboarding_submissions table to add hometown field to personalInfo
UPDATE onboarding_submissions 
SET data = jsonb_set(
  data, 
  '{personalInfo,hometown}', 
  '""'::jsonb, 
  true
)
WHERE data ? 'personalInfo' 
AND NOT (data->'personalInfo' ? 'hometown');

-- Update creators table to add hometown field to model_profile personalInfo
UPDATE creators 
SET model_profile = jsonb_set(
  model_profile, 
  '{personalInfo,hometown}', 
  '""'::jsonb, 
  true
)
WHERE model_profile ? 'personalInfo' 
AND NOT (model_profile->'personalInfo' ? 'hometown');
