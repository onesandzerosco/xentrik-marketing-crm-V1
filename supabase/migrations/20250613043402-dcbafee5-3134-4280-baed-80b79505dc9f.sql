
-- Update onboarding_submissions table to add additionalLocationNote field to personalInfo
UPDATE onboarding_submissions 
SET data = jsonb_set(
  data, 
  '{personalInfo,additionalLocationNote}', 
  '""'::jsonb, 
  true
)
WHERE data ? 'personalInfo' 
AND NOT (data->'personalInfo' ? 'additionalLocationNote');

-- Update creators table to add additionalLocationNote field to model_profile personalInfo
UPDATE creators 
SET model_profile = jsonb_set(
  model_profile, 
  '{personalInfo,additionalLocationNote}', 
  '""'::jsonb, 
  true
)
WHERE model_profile ? 'personalInfo' 
AND NOT (model_profile->'personalInfo' ? 'additionalLocationNote');
