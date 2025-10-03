-- Permettre aux acheteurs de supprimer leurs propres demandes
CREATE POLICY "Les acheteurs peuvent supprimer leurs demandes"
ON public.contact_requests
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = contact_requests.buyer_id
    AND profiles.user_id = auth.uid()
  )
);

-- Permettre aux acheteurs de relancer (modifier) leurs demandes refusées
DROP POLICY IF EXISTS "Les acheteurs peuvent mettre à jour leurs demandes refusées" ON public.contact_requests;

CREATE POLICY "Les acheteurs peuvent mettre à jour leurs demandes refusées"
ON public.contact_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = contact_requests.buyer_id
    AND profiles.user_id = auth.uid()
  )
  AND status = 'refusee'
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = contact_requests.buyer_id
    AND profiles.user_id = auth.uid()
  )
  AND status = 'en_attente'
);