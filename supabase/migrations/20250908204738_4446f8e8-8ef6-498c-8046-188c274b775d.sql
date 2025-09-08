-- Ajouter une politique RLS pour permettre aux producteurs de voir leurs propres produits
CREATE POLICY "Les producteurs peuvent voir leurs propres produits" 
ON public.products 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM profiles p 
    WHERE p.id = products.producteur_id 
    AND p.user_id = auth.uid()
  )
);