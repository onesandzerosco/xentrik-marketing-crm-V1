
-- Create customs table
CREATE TABLE public.customs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_name TEXT NOT NULL,
  fan_display_name TEXT NOT NULL,
  fan_username TEXT NOT NULL,
  description TEXT NOT NULL,
  sale_date TIMESTAMP WITH TIME ZONE NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  downpayment DECIMAL(10,2) NOT NULL DEFAULT 0,
  full_price DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'partially_paid' CHECK (status IN ('partially_paid', 'fully_paid', 'endorsed', 'done')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sale_by TEXT NOT NULL,
  endorsed_by TEXT,
  sent_by TEXT
);

-- Create custom_status_history table for audit trail
CREATE TABLE public.custom_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  custom_id UUID NOT NULL REFERENCES public.customs(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  chatter_name TEXT,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  changed_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on both tables
ALTER TABLE public.customs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_status_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for customs table
CREATE POLICY "Users can view all customs" ON public.customs FOR SELECT USING (true);
CREATE POLICY "Users can insert customs" ON public.customs FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update customs" ON public.customs FOR UPDATE USING (true);
CREATE POLICY "Users can delete customs" ON public.customs FOR DELETE USING (true);

-- RLS policies for custom_status_history table
CREATE POLICY "Users can view all status history" ON public.custom_status_history FOR SELECT USING (true);
CREATE POLICY "Users can insert status history" ON public.custom_status_history FOR INSERT WITH CHECK (true);

-- Create trigger to update updated_at on customs table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customs_updated_at 
    BEFORE UPDATE ON public.customs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to automatically log status changes
CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.custom_status_history (
            custom_id, 
            old_status, 
            new_status, 
            changed_by
        ) VALUES (
            NEW.id, 
            OLD.status, 
            NEW.status, 
            auth.uid()
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER log_customs_status_change 
    AFTER UPDATE ON public.customs 
    FOR EACH ROW EXECUTE FUNCTION log_status_change();
