-- Create marketing_media table with same structure as media table
CREATE TABLE public.marketing_media (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id text NOT NULL,
  filename text NOT NULL,
  bucket_key text NOT NULL,
  mime text NOT NULL,
  file_size bigint NOT NULL,
  status text NOT NULL DEFAULT 'available'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  thumbnail_url text,
  description text,
  tags text[] DEFAULT '{}'::text[],
  folders text[] DEFAULT '{}'::text[],
  categories text[] DEFAULT '{}'::text[]
);

-- Enable Row Level Security
ALTER TABLE public.marketing_media ENABLE ROW LEVEL SECURITY;

-- Create policies for marketing_media (same as media table)
CREATE POLICY "Allow authenticated users to select marketing media" 
ON public.marketing_media 
FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated users to insert marketing media" 
ON public.marketing_media 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update their own marketing media" 
ON public.marketing_media 
FOR UPDATE 
USING ((auth.uid())::text = creator_id);

CREATE POLICY "Allow authenticated users to delete their own marketing media" 
ON public.marketing_media 
FOR DELETE 
USING ((auth.uid())::text = creator_id);

CREATE POLICY "Users can view all marketing media records" 
ON public.marketing_media 
FOR SELECT 
USING (true);

CREATE POLICY "Users can delete their own marketing media" 
ON public.marketing_media 
FOR DELETE 
USING ((auth.uid())::text = creator_id);

CREATE POLICY "Users can update their own marketing media" 
ON public.marketing_media 
FOR UPDATE 
USING ((auth.uid())::text = creator_id);

CREATE POLICY "Creators can delete their own marketing media" 
ON public.marketing_media 
FOR DELETE 
USING ((creator_id = (auth.uid())::text) AND (EXISTS ( SELECT 1
   FROM creators
  WHERE (creators.id = (auth.uid())::text))));

CREATE POLICY "Creators can insert marketing media records" 
ON public.marketing_media 
FOR INSERT 
WITH CHECK ((creator_id = (auth.uid())::text) AND (EXISTS ( SELECT 1
   FROM creators
  WHERE (creators.id = (auth.uid())::text))));

CREATE POLICY "Creators can update their own marketing media" 
ON public.marketing_media 
FOR UPDATE 
USING ((creator_id = (auth.uid())::text) AND (EXISTS ( SELECT 1
   FROM creators
  WHERE (creators.id = (auth.uid())::text))));

CREATE POLICY "Authenticated users can upload marketing media" 
ON public.marketing_media 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated'::text);

CREATE POLICY "Anyone can view marketing media" 
ON public.marketing_media 
FOR SELECT 
USING (true);