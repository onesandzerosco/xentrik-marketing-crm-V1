-- Drop existing restrictive policies that might be blocking operations
DROP POLICY IF EXISTS "Admins can manage all sales data" ON public.sales_tracker;
DROP POLICY IF EXISTS "Chatters can manage their own sales data" ON public.sales_tracker;
DROP POLICY IF EXISTS "VAs can view all sales data" ON public.sales_tracker;

-- Create more permissive but still secure policies for sales_tracker

-- Allow admins full access to all sales data
CREATE POLICY "Admins can manage all sales data" ON public.sales_tracker
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.role = 'Admin' OR 'Admin' = ANY(profiles.roles))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.role = 'Admin' OR 'Admin' = ANY(profiles.roles))
  )
);

-- Allow VAs to view all sales data
CREATE POLICY "VAs can view all sales data" ON public.sales_tracker
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.role = 'VA' OR 'VA' = ANY(profiles.roles))
  )
);

-- Allow chatters to manage their own sales data
CREATE POLICY "Chatters can manage their own sales data" ON public.sales_tracker
FOR ALL
TO authenticated
USING (
  chatter_id = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.role = 'Chatter' OR 'Chatter' = ANY(profiles.roles))
  )
)
WITH CHECK (
  chatter_id = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.role = 'Chatter' OR 'Chatter' = ANY(profiles.roles))
  )
);