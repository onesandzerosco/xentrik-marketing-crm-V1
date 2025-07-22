-- Create sales_tracker table
CREATE TABLE public.sales_tracker (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    week_start_date DATE NOT NULL, -- Thursday date that starts the week
    model_name TEXT NOT NULL,
    day_of_week INTEGER NOT NULL, -- 0=Thursday, 1=Friday, 2=Saturday, 3=Sunday, 4=Monday, 5=Tuesday, 6=Wednesday
    earnings DECIMAL(10,2) NOT NULL DEFAULT 0,
    chatter_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(week_start_date, model_name, day_of_week)
);

-- Enable RLS
ALTER TABLE public.sales_tracker ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admins can view and edit all sales data
CREATE POLICY "Admins can manage all sales data"
ON public.sales_tracker
FOR ALL
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND (role = 'Admin' OR 'Admin' = ANY(roles))
    )
)
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND (role = 'Admin' OR 'Admin' = ANY(roles))
    )
);

-- Chatters can only view and edit their own sales data
CREATE POLICY "Chatters can manage their own sales data"
ON public.sales_tracker
FOR ALL
TO authenticated
WITH CHECK (
    chatter_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND (role = 'Chatter' OR 'Chatter' = ANY(roles))
    )
)
USING (
    chatter_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND (role = 'Chatter' OR 'Chatter' = ANY(roles))
    )
);

-- VAs can view all sales data but not edit
CREATE POLICY "VAs can view all sales data"
ON public.sales_tracker
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND (role = 'VA' OR 'VA' = ANY(roles))
    )
);

-- Create trigger for updating timestamps
CREATE TRIGGER update_sales_tracker_updated_at
    BEFORE UPDATE ON public.sales_tracker
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create table for storing model names
CREATE TABLE public.sales_models (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    model_name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS for sales_models
ALTER TABLE public.sales_models ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view and manage models
CREATE POLICY "Authenticated users can manage sales models"
ON public.sales_models
FOR ALL
TO authenticated
WITH CHECK (auth.role() = 'authenticated')
USING (auth.role() = 'authenticated');