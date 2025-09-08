-- Ajouter la politique pour permettre aux producteurs de supprimer leurs propres produits
CREATE POLICY "products_delete_own" 
ON public.products 
FOR DELETE 
USING (EXISTS (
  SELECT 1 
  FROM profiles p 
  WHERE p.id = products.producteur_id 
  AND p.user_id = auth.uid()
));