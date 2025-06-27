
-- Add attachments column to customs table to store file IDs
ALTER TABLE public.customs 
ADD COLUMN attachments TEXT[] DEFAULT '{}';

-- Create storage bucket for custom attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('custom_attachments', 'custom_attachments', true);

-- Create RLS policies for the custom_attachments bucket
CREATE POLICY "Allow authenticated users to upload custom attachments" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'custom_attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view custom attachments" ON storage.objects
FOR SELECT USING (bucket_id = 'custom_attachments');

CREATE POLICY "Allow authenticated users to delete custom attachments" ON storage.objects
FOR DELETE USING (bucket_id = 'custom_attachments' AND auth.role() = 'authenticated');
