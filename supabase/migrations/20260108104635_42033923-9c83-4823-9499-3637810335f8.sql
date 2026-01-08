-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "products_insert_producer" ON public.products;

-- Create a new INSERT policy that checks profiles.user_type directly
CREATE POLICY "products_insert_producer" 
ON public.products 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM profiles p 
    WHERE p.id = products.producteur_id 
      AND p.user_id = auth.uid()
      AND p.user_type = 'producteur'
  )
);