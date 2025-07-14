-- Update existing onboarding_submissions to add the new dick rate and underwear selling fields to contentAndService
UPDATE onboarding_submissions 
SET data = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        data,
        '{contentAndService,dickRatePrice}',
        'null'::jsonb,
        true
      ),
      '{contentAndService,dickRateNotes}',
      '""'::jsonb,
      true
    ),
    '{contentAndService,underwearSellingPrice}',
    'null'::jsonb,
    true
  ),
  '{contentAndService,underwearSellingNotes}',
  '""'::jsonb,
  true
)
WHERE data ? 'contentAndService' 
AND NOT (data->'contentAndService' ? 'dickRatePrice');

-- Update existing creators to add the new dick rate and underwear selling fields to model_profile contentAndService
UPDATE creators 
SET model_profile = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        model_profile,
        '{contentAndService,dickRatePrice}',
        'null'::jsonb,
        true
      ),
      '{contentAndService,dickRateNotes}',
      '""'::jsonb,
      true
    ),
    '{contentAndService,underwearSellingPrice}',
    'null'::jsonb,
    true
  ),
  '{contentAndService,underwearSellingNotes}',
  '""'::jsonb,
  true
)
WHERE model_profile ? 'contentAndService' 
AND NOT (model_profile->'contentAndService' ? 'dickRatePrice');