
-- Create model_announcements table
CREATE TABLE public.model_announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Add foreign key reference to creators table
ALTER TABLE public.model_announcements 
ADD CONSTRAINT fk_model_announcements_creator 
FOREIGN KEY (creator_id) REFERENCES public.creators(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE public.model_announcements ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing announcements (Admin, VA, Chatter can read)
CREATE POLICY "Users with access can view announcements" 
  ON public.model_announcements 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND (
        role IN ('Admin', 'VA', 'Chatter') 
        OR 'Admin' = ANY(roles) 
        OR 'VA' = ANY(roles) 
        OR 'Chatter' = ANY(roles)
      )
    )
  );

-- Create policy for creating announcements (only Admin)
CREATE POLICY "Only admins can create announcements" 
  ON public.model_announcements 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND (role = 'Admin' OR 'Admin' = ANY(roles))
    )
  );

-- Create policy for updating announcements (only Admin)
CREATE POLICY "Only admins can update announcements" 
  ON public.model_announcements 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND (role = 'Admin' OR 'Admin' = ANY(roles))
    )
  );

-- Create policy for deleting announcements (only Admin)
CREATE POLICY "Only admins can delete announcements" 
  ON public.model_announcements 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND (role = 'Admin' OR 'Admin' = ANY(roles))
    )
  );

-- Create updated_at trigger
CREATE TRIGGER handle_updated_at_model_announcements
  BEFORE UPDATE ON public.model_announcements
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create index for better performance
CREATE INDEX idx_model_announcements_creator_id ON public.model_announcements(creator_id);
CREATE INDEX idx_model_announcements_created_at ON public.model_announcements(created_at DESC);
