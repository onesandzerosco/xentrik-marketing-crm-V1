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

-- Create table for storing model names
CREATE TABLE public.sales_models (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    model_name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS for sales_models
ALTER TABLE public.sales_models ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role_and_roles(user_id UUID)
RETURNS TABLE(user_role TEXT, user_roles TEXT[]) AS $$
BEGIN
    RETURN QUERY
    SELECT p.role, p.roles
    FROM public.profiles p
    WHERE p.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- RLS Policies for sales_tracker
-- Admins can view and edit all sales data
CREATE POLICY "Admins can manage all sales data"
ON public.sales_tracker
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.get_user_role_and_roles(auth.uid()) AS ur
        WHERE ur.user_role = 'Admin' OR 'Admin' = ANY(ur.user_roles)
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.get_user_role_and_roles(auth.uid()) AS ur
        WHERE ur.user_role = 'Admin' OR 'Admin' = ANY(ur.user_roles)
    )
);

-- Chatters can only view and edit their own sales data
CREATE POLICY "Chatters can manage their own sales data"
ON public.sales_tracker
FOR ALL
TO authenticated
USING (
    chatter_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.get_user_role_and_roles(auth.uid()) AS ur
        WHERE ur.user_role = 'Chatter' OR 'Chatter' = ANY(ur.user_roles)
    )
)
WITH CHECK (
    chatter_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.get_user_role_and_roles(auth.uid()) AS ur
        WHERE ur.user_role = 'Chatter' OR 'Chatter' = ANY(ur.user_roles)
    )
);

-- VAs can view all sales data but not edit
CREATE POLICY "VAs can view all sales data"
ON public.sales_tracker
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.get_user_role_and_roles(auth.uid()) AS ur
        WHERE ur.user_role = 'VA' OR 'VA' = ANY(ur.user_roles)
    )
);

-- Allow authenticated users to view and manage sales models
CREATE POLICY "Authenticated users can view sales models"
ON public.sales_models
FOR SELECT
TO authenticated
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert sales models"
ON public.sales_models
FOR INSERT
TO authenticated
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update sales models"
ON public.sales_models
FOR UPDATE
TO authenticated
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete sales models"
ON public.sales_models
FOR DELETE
TO authenticated
USING (auth.role() = 'authenticated');

-- Create trigger for updating timestamps
CREATE TRIGGER update_sales_tracker_updated_at
    BEFORE UPDATE ON public.sales_tracker
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();